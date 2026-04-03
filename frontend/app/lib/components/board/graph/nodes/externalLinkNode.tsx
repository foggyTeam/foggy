'use client';

import NodeWrapper from '@/app/lib/components/board/graph/nodes/nodeWrapper';
import React, {
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { GExternalLinkNode } from '@/app/lib/types/definitions';
import { observer } from 'mobx-react-lite';
import { Image } from '@heroui/image';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import { Input, Textarea } from '@heroui/input';
import settingsStore from '@/app/stores/settingsStore';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import debounce from 'lodash/debounce';
import getLinkPreview from '@/app/lib/utils/getLinkPreview';
import { Avatar } from '@heroui/avatar';
import { GlobeIcon } from 'lucide-react';
import ImagePlaceholder from '@/public/images/undraw_playful-cat_3ta5.png';
import useGraphNode from '@/app/lib/hooks/graphBoard/useGraphNode';
import { externalLinkNodeSchema } from '@/app/lib/types/schemas';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';
import { PressEvent } from '@heroui/button';

type GExternalLinkNodeData = GExternalLinkNode['data'];
type UrlData = Partial<GExternalLinkNode['data']>;

const ExternalLinkNode = observer((node: GExternalLinkNode) => {
  const data = graphBoardStore.nodesDataMap?.get(
    node.id,
  ) as GExternalLinkNodeData;

  const { smallerSize } = useAdaptiveParams();
  const { allToolsDisabled, toolsDisabled } = useGraphBoardContext();
  const [isLoading, setIsLoading] = useState(false);

  const {
    nodeState,
    dispatch,
    errors,
    isEditing,
    debouncedUpdate,
    onBlur,
    toggleEdit,
    onCopyLink,
  } = useGraphNode<GExternalLinkNodeData>(
    node.id,
    node.selected,
    data,
    !!data?.url,
    externalLinkNodeSchema,
    () => loadLinkData.current.cancel(),
  );
  const setUrl = useCallback(
    (v: GExternalLinkNodeData['url']) => dispatch({ url: v }),
    [],
  );
  const setDescription = useCallback(
    (v: GExternalLinkNodeData['description']) => dispatch({ description: v }),
    [],
  );

  useEffect(() => {
    if (data?.url !== nodeState.url)
      loadLinkData.current(nodeState.url, nodeState.description);
  }, [nodeState.url]);

  const loadLinkData = useRef(
    debounce(
      async (newUrl: string | undefined, description: string | undefined) => {
        setIsLoading(true);
        const data = await getLinkPreview(newUrl);
        const urlData: UrlData = data
          ? {
              url: newUrl || undefined,
              thumbnailUrl: data.preview || '',
              favicon: data.favicon,
              domain: data.title || data.domain,
              description: description || data.description || '',
            }
          : {
              url: newUrl || undefined,
              thumbnailUrl: '',
              favicon: '',
              domain: '',
              description,
            };

        setIsLoading(false);
        debouncedUpdate.current(urlData);
      },
      512,
    ),
  );

  const openLink = (e: MouseEvent | PressEvent, dbl = false) => {
    if (e.ctrlKey || e.metaKey || dbl) {
      if (data?.url && data?.domain && !isEditing)
        window.open(data.url, '_blank');
    }
  };

  return (
    <NodeWrapper
      isSelected={node.selected}
      onPress={openLink}
      onDblClick={(e) => openLink(e, true)}
      onBlur={onBlur}
      toolbarProps={{
        onToggleEdit: toggleEdit,
        onCopyNodeLink: onCopyLink,
      }}
    >
      {(isEditing || data?.thumbnailUrl) && (
        <Image
          isLoading={isLoading}
          alt="Link thumbnail"
          src={data?.thumbnailUrl || ImagePlaceholder.src}
          className="max-h-56 w-full overflow-clip"
          isZoomed
          width={208}
        />
      )}

      {!isEditing && (
        <div className="flex flex-col gap-1">
          <div className="flex h-full w-full items-center justify-start gap-2">
            <Avatar
              fallback={<GlobeIcon className="text-f_accent-500 h-5 w-5" />}
              showFallback
              className="shrink-0"
              classNames={{
                base: 'h-7 w-7',
              }}
              src={data?.favicon}
              name={data?.domain}
            />
            <h1 className="line-clamp-1 w-fit truncate font-medium text-nowrap">
              {data?.domain ||
                data?.url ||
                settingsStore.t.toolBar.emptyLinkDomain}
            </h1>
          </div>

          {data?.description && (
            <p className="text-default-700 line-clamp-2 h-fit w-full text-start text-xs whitespace-pre-wrap italic">
              {data.description}
            </p>
          )}
        </div>
      )}

      {isEditing && (
        <div
          className="nopan nodrag nowheel flex flex-col gap-1"
          onKeyDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onBlur={onBlur}
        >
          <Input
            inputMode="url"
            isReadOnly={allToolsDisabled || toolsDisabled || !node.draggable}
            isInvalid={!!errors.current.url}
            errorMessage={errors.current.url}
            placeholder={settingsStore.t.toolBar.linkPlaceholder}
            label={settingsStore.t.toolBar.linkLabel}
            type="url"
            value={nodeState.url}
            onValueChange={setUrl}
            autoFocus
            color="primary"
            variant="underlined"
            size={smallerSize}
            className="w-full"
            classNames={{
              input: 'text-default-500 font-medium',
            }}
          />

          <Textarea
            isReadOnly={allToolsDisabled || toolsDisabled || !node.draggable}
            isInvalid={!!errors.current.description}
            errorMessage={errors.current.description}
            color="primary"
            variant="underlined"
            maxRows={2}
            label={settingsStore.t.toolBar.descriptionLabel}
            labelPlacement="inside"
            name="description"
            placeholder={settingsStore.t.toolBar.descriptionPlaceholder}
            type="description"
            autoComplete="description"
            size={smallerSize}
            value={nodeState.description}
            onValueChange={setDescription}
            classNames={{
              input: 'text-default-500 font-medium',
            }}
          />
        </div>
      )}
    </NodeWrapper>
  );
});

export default ExternalLinkNode;

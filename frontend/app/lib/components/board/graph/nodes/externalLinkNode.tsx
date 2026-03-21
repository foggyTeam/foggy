'use client';

import NodeWrapper from '@/app/lib/components/board/graph/nodes/nodeWrapper';
import React, { useEffect, useRef, useState } from 'react';
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

type UrlData = Partial<GExternalLinkNode['data']>;

const ExternalLinkNode = observer((node: GExternalLinkNode) => {
  const data: GExternalLinkNode['data'] = graphBoardStore.nodesDataMap?.get(
    node.id,
  );

  const { smallerSize } = useAdaptiveParams();

  const [url, setUrl] = useState(data.url || '');
  const [description, setDescription] = useState(data.description || '');
  const [isLoading, setIsLoading] = useState(false);

  const { isEditing, isSelected, debouncedUpdate, onBlur, toggleEdit } =
    useGraphNode(node.id, !!data.url, () => loadLinkData.current.cancel());

  useEffect(() => {
    if (isEditing && url !== data.url) setUrl(data.url || '');
    if (isEditing && description !== data.description)
      setDescription(data.description || '');
  }, [isEditing]);

  useEffect(() => {
    if (data.url !== url) loadLinkData.current(url, description);
  }, [url]);

  useEffect(() => {
    if (data.description !== description)
      debouncedUpdate.current({ description });
  }, [description]);

  const loadLinkData = useRef(
    debounce(async (newUrl: string | undefined, description: string) => {
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
            description: description,
          };

      setIsLoading(false);
      debouncedUpdate.current(urlData);
    }, 512),
  );

  const openLink = (e: MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (data.url && data.domain && !isEditing)
        window.open(data.url, '_blank');
    }
  };

  return (
    <NodeWrapper
      isSelected={isSelected}
      onPress={openLink}
      onBlur={onBlur}
      toolbarProps={{
        toggleEdit,
      }}
    >
      {(isEditing || data.thumbnailUrl) && (
        <Image
          isLoading={isLoading}
          alt="Link thumbnail"
          src={data.thumbnailUrl || ImagePlaceholder.src}
          className="max-h-56 w-full overflow-clip"
          isZoomed
          width={208}
        />
      )}

      {!isEditing && (
        <div className="flex flex-col gap-1">
          <div className="flex h-full w-full items-center justify-start gap-1">
            <Avatar
              fallback={<GlobeIcon className="text-default-500 h-5 w-5" />}
              showFallback
              className="flex-shrink-0"
              classNames={{
                base: 'h-7 w-7',
              }}
              src={data.favicon}
              name={data.domain}
            />
            <h1 className="line-clamp-1 w-fit truncate font-medium text-nowrap">
              {data.domain || settingsStore.t.toolBar.emptyLinkDomain}
            </h1>
          </div>

          {data.description && (
            <p className="text-default-700 line-clamp-2 h-fit w-full text-start text-xs whitespace-pre-wrap italic">
              {data.description}
            </p>
          )}
        </div>
      )}

      {isEditing && (
        <div
          className="flex flex-col gap-1"
          onKeyDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onBlur={(e) => e.stopPropagation()}
        >
          {/*TODO: add zod rules */}
          <Input
            isLoading={isLoading}
            placeholder={settingsStore.t.toolBar.linkPlaceholder}
            label={settingsStore.t.toolBar.linkLabel}
            type="link"
            value={url}
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
            value={description}
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

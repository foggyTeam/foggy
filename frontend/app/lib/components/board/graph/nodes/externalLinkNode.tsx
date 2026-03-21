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
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';
import ImagePlaceholder from '@/public/images/undraw_playful-cat_3ta5.png';

type UrlData = Partial<GExternalLinkNode['data']>;

const ExternalLinkNode = observer((node: GExternalLinkNode) => {
  const data: GExternalLinkNode['data'] = graphBoardStore.nodesDataMap?.get(
    node.id,
  );

  const { smallerSize } = useAdaptiveParams();
  const { selectedElements } = useGraphBoardContext();

  const [isEditing, setIsEditing] = useState(!data.url);
  const [url, setUrl] = useState(data.url || '');
  const [description, setDescription] = useState(data.description || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditing && url !== data.url) setUrl(data.url || '');
    if (isEditing && description !== data.description)
      setDescription(data.description || '');
  }, [isEditing]);
  useEffect(() => {
    if (selectedElements.length !== 1 || selectedElements[0].id !== node.id)
      handleBlur();
  }, [selectedElements]);

  useEffect(() => {
    if (data.url !== url) loadLinkData.current(url, description);
  }, [url]);

  useEffect(() => {
    if (data.description !== description)
      debouncedDataUpdate.current({ description });
  }, [description]);

  useEffect(() => {
    return () => {
      debouncedDataUpdate.current.cancel();
      loadLinkData.current.cancel();
    };
  }, []);

  const debouncedDataUpdate = useRef(
    debounce((newAttrs: Partial<GExternalLinkNode['data']>) => {
      graphBoardStore.updateNodeData(node.id, newAttrs);
    }, 512),
  );

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
      debouncedDataUpdate.current(urlData);
    }, 512),
  );

  const handleBlur = () => {
    if (data.url) setIsEditing(false);
  };

  const openLink = (e: MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (data.url && data.domain && !isEditing)
        window.open(data.url, '_blank');
    }
  };

  return (
    <NodeWrapper
      isSelected={
        selectedElements.length === 1 && selectedElements[0].id === node.id
      }
      onPress={openLink}
      onBlur={handleBlur}
      toolbarProps={{
        toggleEdit: () => setIsEditing((prev) => !prev),
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
            <p className="text-default-700 line-clamp-2 h-fit w-full text-start text-xs italic">
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
            label={settingsStore.t.toolBar.linkDescriptionLabel}
            labelPlacement="inside"
            name="description"
            placeholder={settingsStore.t.toolBar.linkDescriptionPlaceholder}
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

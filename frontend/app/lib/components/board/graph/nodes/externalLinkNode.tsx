'use client';

import NodeWrapper from '@/app/lib/components/board/graph/nodes/nodeWrapper';
import React, { useEffect, useState } from 'react';
import { GExternalLinkNode } from '@/app/lib/types/definitions';
import { observer } from 'mobx-react-lite';
import { Image } from '@heroui/image';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import { Input } from '@heroui/input';
import settingsStore from '@/app/stores/settingsStore';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import debounce from 'lodash/debounce';
import getLinkPreview from '@/app/lib/utils/getLinkPreview';
import { Avatar } from '@heroui/avatar';

const ExternalLinkNode = observer((node: GExternalLinkNode) => {
  const { smallerSize } = useAdaptiveParams();
  const data: GExternalLinkNode['data'] = graphBoardStore.nodesDataMap?.get(
    node.id,
  );
  const [isEditing, setIsEditing] = useState(!data.url);
  const [isLoading, setIsLoading] = useState(false);
  const [isVertical, setIsVertical] = useState(false);

  const [url, setUrl] = useState(data.url || '');
  const [urlData, setUrlData] = useState({
    thumbnailUrl: data.thumbnailUrl,
    favicon: data.favicon,
    domain: data.domain,
    description: data.description,
  });

  useEffect(() => {
    if (isEditing && url !== data.url) setUrl(data.url || '');
  }, [isEditing]);

  const loadLinkData = debounce(async (newUrl: string | undefined) => {
    setIsLoading(true);
    const data = await getLinkPreview(newUrl);
    if (data) {
      setUrlData({
        thumbnailUrl: data.preview || '',
        favicon: data.favicon,
        domain: data.title || data.domain,
        description: data.description || '',
      });
    } else {
      setUrlData({
        thumbnailUrl: '',
        favicon: '',
        domain: '',
        description: '',
      });
    }
    setIsLoading(false);
    handleUrlChange(newUrl);
  }, 512);

  const handleUrlChange = (newUrl: string | undefined) => {
    if (data.url !== newUrl)
      graphBoardStore.updateNodeData(node.id, {
        url: newUrl || undefined,
        ...urlData,
      });
  };

  return (
    <NodeWrapper>
      {!!data.thumbnailUrl?.length && (
        <Image
          isLoading={isLoading}
          alt="Link thumbnail"
          src={data.thumbnailUrl}
          className="max-h-56 w-full overflow-clip"
          isZoomed
          width={208}
        />
      )}

      <div className="flex flex-col gap-1">
        <div className="flex h-full w-full items-center justify-start gap-1">
          <Avatar
            classNames={{
              base: 'h-7 w-7',
            }}
            src={data.favicon}
            name={data.domain}
          />
          <h1 className="line-clamp-1 w-fit max-w-24 truncate font-medium text-nowrap">
            {data.domain || 'No domain'}
          </h1>
        </div>

        <p className="text-default-700 line-clamp-2 h-fit w-full text-start text-xs">
          {data.description || 'No description'}
        </p>
      </div>

      <Input
        isLoading={isLoading}
        placeholder={settingsStore.t.toolBar.linkPlaceholder}
        label={settingsStore.t.toolBar.linkLabel}
        type="link"
        value={url}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        onValueChange={async (value: string) => {
          setUrl(value);
          await loadLinkData(value);
        }}
        color="primary"
        variant="underlined"
        size={smallerSize}
        className="w-full"
        classNames={{
          input: 'text-default-500 font-medium',
        }}
      />
    </NodeWrapper>
  );
});

export default ExternalLinkNode;

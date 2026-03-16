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

const ExternalLinkNode = observer((node: GExternalLinkNode) => {
  const { smallerSize } = useAdaptiveParams();
  const data: GExternalLinkNode['data'] = graphBoardStore.nodesDataMap?.get(
    node.id,
  );
  const [isEditing, setIsEditing] = useState(!data.url);
  const [url, setUrl] = useState(data.url || '');
  const [urlData, setUrlData] = useState({
    thumbnailUrl: data.thumbnailUrl,
    favicon: data.favicon,
    description: data.description,
  });

  useEffect(() => {
    if (isEditing && url !== data.url) setUrl(data.url || '');
    if (!isEditing) handleUrlChange();
  }, [isEditing]);

  const loadLinkData = debounce(async (newUrl: string | undefined) => {
    if (!newUrl?.length) return;
    console.log(newUrl, 'loading thumb...');
    // setUrlData
  }, 512);

  const handleUrlChange = () => {
    if (data.url !== url)
      graphBoardStore.updateNodeData(node.id, {
        url: url || undefined,
        ...urlData,
      });
  };

  return (
    <NodeWrapper>
      {!!data.thumbnailUrl?.length && (
        <Image
          alt="Link thumbnail"
          src={data.thumbnailUrl}
          className="h-32 w-52"
          isZoomed
        />
      )}
      <div className="ga-1 flex flex-col">
        <b>{data.domain || 'No domain'}</b>
        <p className="text-default-500">
          {data.description || 'No description'}
        </p>
      </div>

      <Input
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
        className="w-52"
        classNames={{
          input: 'text-default-500 font-medium',
        }}
      />
    </NodeWrapper>
  );
});

export default ExternalLinkNode;

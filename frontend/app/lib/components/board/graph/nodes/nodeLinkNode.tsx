'use client';

import NodeWrapper from '@/app/lib/components/board/graph/nodes/nodeWrapper';
import React, { MouseEvent, useCallback } from 'react';
import { GNodeLinkNode } from '@/app/lib/types/definitions';
import { observer } from 'mobx-react-lite';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import { Input } from '@heroui/input';
import settingsStore from '@/app/stores/settingsStore';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { LinkIcon } from 'lucide-react';
import useGraphNode from '@/app/lib/hooks/graphBoard/useGraphNode';
import { usePathname } from 'next/navigation';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';
import { nodeToNodeLinkSchema } from '@/app/lib/types/schemas';
import { PressEvent } from '@heroui/button';

type GNodeLinkNodeData = GNodeLinkNode['data'];

const NodeLinkNode = observer((node: GNodeLinkNode) => {
  const path = usePathname();
  const { zoomNode, allToolsDisabled, toolsDisabled } = useGraphBoardContext();
  const data = graphBoardStore.nodesDataMap?.get(node.id) as GNodeLinkNodeData;

  const { smallerSize } = useAdaptiveParams();

  const {
    nodeState,
    dispatch,
    errors,
    isEditing,
    onBlur,
    toggleEdit,
    onCopyLink,
  } = useGraphNode<GNodeLinkNodeData>(
    node.id,
    node.selected,
    data,
    !!data.url,
    nodeToNodeLinkSchema,
  );
  const getNodeId = (v: string | undefined) => {
    if (!v) return undefined;

    try {
      const url = new URL(v);
      return url.searchParams.get('node_id') || undefined;
    } catch {
      return undefined;
    }
  };
  const setUrl = useCallback(
    (v: GNodeLinkNodeData['url']) => dispatch({ url: v, nodeId: getNodeId(v) }),
    [],
  );
  const setTitle = useCallback(
    (v: GNodeLinkNodeData['title']) => dispatch({ title: v }),
    [],
  );

  const openLink = async (e: MouseEvent | PressEvent, dbl = false) => {
    if (e.ctrlKey || e.metaKey || dbl) {
      if (data?.url && !isEditing) {
        if (data.url.includes(path) && data.nodeId) await zoomNode(data.nodeId);
        else window.open(data.url, '_blank');
      }
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
      {!isEditing && (
        <div className="flex h-7 w-full items-center justify-start gap-2">
          <LinkIcon className="text-f_accent-500 h-5 w-5 shrink-0" />
          <h1 className="line-clamp-1 w-fit truncate font-medium text-nowrap">
            {data?.title || data?.url || settingsStore.t.toolBar.emptyLink}
          </h1>
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
            onPointerDown={(e: PointerEvent) => e.stopPropagation()}
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

          <Input
            onPointerDown={(e: PointerEvent) => e.stopPropagation()}
            isReadOnly={allToolsDisabled || toolsDisabled || !node.draggable}
            isInvalid={!!errors.current.title}
            errorMessage={errors.current.title}
            placeholder={settingsStore.t.toolBar.titlePlaceholder}
            label={settingsStore.t.toolBar.titleLabel}
            type="title"
            value={nodeState.title}
            onValueChange={setTitle}
            color="primary"
            variant="underlined"
            size={smallerSize}
            className="w-full"
            classNames={{
              input: 'text-default-500 font-medium',
            }}
          />
        </div>
      )}
    </NodeWrapper>
  );
});

export default NodeLinkNode;

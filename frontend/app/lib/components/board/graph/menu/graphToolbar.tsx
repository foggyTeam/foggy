'use client';

import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import React, { useMemo } from 'react';
import CustomNodeTool from '@/app/lib/components/board/graph/tools/customNodeTool';
import InternalLinkTool from '@/app/lib/components/board/graph/tools/internalLinkTool';
import ExternalLinkTool from '@/app/lib/components/board/graph/tools/externalLinkTool';
import NodeLinkTool from '@/app/lib/components/board/graph/tools/nodeLinkTool';
import { Divider } from '@heroui/divider';
import DeleteTool from '@/app/lib/components/board/graph/tools/deleteTool';
import { useGraphBoardSelection } from '@/app/lib/components/board/graph/graphBoardContext';
import { GEdge } from '@/app/lib/types/definitions';
import GraphEdgeToolbar from '@/app/lib/components/board/graph/menu/graphEdgeToolbar';

export default function GraphToolbar({
  onEdgeUpdate,
}: {
  onEdgeUpdate: (id: string, updatedEdge: GEdge) => void;
}) {
  const { selectedElements } = useGraphBoardSelection();
  const selectedEdgeId = useMemo(() => {
    if (selectedElements.size !== 1) return null;
    const e = selectedElements.values().next().value as string;
    const [type, id] = e.split('|');
    return type === 'edge' ? id : null;
  }, [selectedElements]);

  const tools = [
    InternalLinkTool,
    ExternalLinkTool,
    CustomNodeTool,
    NodeLinkTool,
  ];

  return (
    <div
      data-testid="board-toolbar"
      className={clsx(
        'w-full justify-self-center px-4 py-3 sm:z-50',
        'sm:w-fit sm:rounded-2xl sm:rounded-tr-[64px] sm:px-6',
        bg_container_no_padding,
        'flex flex-col justify-center gap-1 rounded-t-none rounded-l-none rounded-r-none',
        'overflow-visible',
      )}
    >
      {selectedEdgeId && (
        <GraphEdgeToolbar edgeId={selectedEdgeId} onEdgeUpdate={onEdgeUpdate} />
      )}
      {selectedEdgeId && <Divider />}
      <div className="flex justify-center gap-1">
        {tools.map((Tool, index) => (
          <Tool key={index} />
        ))}
        {!!selectedElements.size && (
          <>
            <Divider orientation="vertical" />
            <DeleteTool />
          </>
        )}
      </div>
    </div>
  );
}

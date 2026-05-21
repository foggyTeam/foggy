'use client';

import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import GraphBoardObserver from '@/app/lib/components/board/graph/graphBoard';
import {
  GraphBoardProvider,
  useGraphBoardContext,
} from '@/app/lib/components/board/graph/graphBoardContext';
import React from 'react';
import GraphBoardCursors from '@/app/lib/components/board/graph/graphBoardCursors';
import BoardImageGenerator from '@/app/lib/components/board/ai/boardImageGenerator';
import AiAssistantButton from '@/app/lib/components/board/ai/aiAssistantButton';
import graphBoardStore from '@/app/stores/board/graphBoardStore';

const AdditionsWrapper = () => {
  const { getNodes, getNodesBounds, addNodes } = useReactFlow();
  const { createNewElement } = useGraphBoardContext();

  function addGraphNode(nodeParams: any) {
    let newElement = createNewElement(
      { clientX: 0, clientY: 0 } as any,
      'custom-node',
    );
    if (!newElement) return;

    Object.assign(newElement, nodeParams);
    const success = graphBoardStore.updateNodeData(
      newElement.id,
      newElement.data,
      true,
    );

    if (success) {
      addNodes([newElement]);
      const change = { type: 'add', item: newElement };
      graphBoardStore.emitUpdates('nodesUpdate', [change]);
    }
  }

  return (
    <>
      <BoardImageGenerator
        boardData={{
          type: 'GRAPH',
          data: { getNodes, getNodesBounds },
        }}
      />
      <AiAssistantButton
        boardData={{
          type: 'GRAPH',
          data: { getNodes, getNodesBounds },
        }}
        addElementAction={addGraphNode}
      />
    </>
  );
};

export default function GraphBoardClientWrapper() {
  return (
    <ReactFlowProvider>
      <GraphBoardProvider>
        <GraphBoardObserver />
        <GraphBoardCursors />
        <AdditionsWrapper />
      </GraphBoardProvider>
    </ReactFlowProvider>
  );
}

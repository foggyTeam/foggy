'use client';

import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import GraphBoardObserver from '@/app/lib/components/board/graph/graphBoard';
import { GraphBoardProvider } from '@/app/lib/components/board/graph/graphBoardContext';
import React from 'react';
import GraphBoardCursors from '@/app/lib/components/board/graph/graphBoardCursors';
import BoardImageGenerator from '@/app/lib/components/board/ai/boardImageGenerator';
import AiAssistantButton from '@/app/lib/components/board/ai/aiAssistantButton';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import getGraphNodesChain from '@/app/lib/utils/getGraphNodesChain';

const AdditionsWrapper = () => {
  const { getNodes, getNodesBounds, addNodes, addEdges } = useReactFlow();

  function addGraphNodes(generatedElement: {
    text: string;
    position: { x: number; y: number };
  }) {
    const { nodes, edges } = getGraphNodesChain(
      generatedElement.text,
      generatedElement.position,
    );

    const updatesQueue: any[] = [];

    for (const node of nodes) {
      const success = graphBoardStore.updateNodeData(node.id, node.data, true);

      if (success) updatesQueue.push({ type: 'add', item: node });
    }
    addNodes(nodes);
    addEdges(edges);

    graphBoardStore.emitUpdates('nodesUpdate', updatesQueue);
    graphBoardStore.emitUpdates(
      'edgesUpdate',
      edges.map((edge) => ({ type: 'add', item: edge })),
    );
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
        addElementAction={addGraphNodes}
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

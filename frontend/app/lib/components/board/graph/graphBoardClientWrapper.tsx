'use client';

import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import GraphBoardObserver from '@/app/lib/components/board/graph/graphBoard';
import { GraphBoardProvider } from '@/app/lib/components/board/graph/graphBoardContext';
import React from 'react';
import GraphBoardCursors from '@/app/lib/components/board/graph/graphBoardCursors';
import BoardImageGenerator from '@/app/lib/components/board/simple/ai/boardImageGenerator';

const ImageGeneratorWrapper = () => {
  const { getNodes, getEdges, getNodesBounds } = useReactFlow();
  return (
    <BoardImageGenerator
      boardData={{
        type: 'GRAPH',
        data: { getNodes, getEdges, getNodesBounds },
      }}
    />
  );
};

export default function GraphBoardClientWrapper() {
  return (
    <ReactFlowProvider>
      <GraphBoardProvider>
        <GraphBoardObserver />
        <GraphBoardCursors />
        <ImageGeneratorWrapper />
      </GraphBoardProvider>
    </ReactFlowProvider>
  );
}

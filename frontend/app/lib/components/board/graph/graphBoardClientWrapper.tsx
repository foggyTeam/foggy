'use client';

import { ReactFlowProvider } from '@xyflow/react';
import GraphBoardObserver from '@/app/lib/components/board/graph/graphBoard';
import { GraphBoardProvider } from '@/app/lib/components/board/graph/graphBoardContext';
import React from 'react';
import GraphBoardCursors from '@/app/lib/components/board/graph/graphBoardCursors';

export default function GraphBoardClientWrapper() {
  return (
    <ReactFlowProvider>
      <GraphBoardProvider>
        <GraphBoardObserver />
        <GraphBoardCursors />
      </GraphBoardProvider>
    </ReactFlowProvider>
  );
}

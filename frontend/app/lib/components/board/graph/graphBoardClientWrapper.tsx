'use client';

import { ReactFlowProvider } from '@xyflow/react';
import GraphBoardObserver from '@/app/lib/components/board/graph/graphBoard';
import { GraphBoardProvider } from '@/app/lib/components/board/graph/graphBoardContext';

export default function GraphBoardClientWrapper() {
  return (
    <ReactFlowProvider>
      <GraphBoardProvider>
        <GraphBoardObserver />
      </GraphBoardProvider>
    </ReactFlowProvider>
  );
}

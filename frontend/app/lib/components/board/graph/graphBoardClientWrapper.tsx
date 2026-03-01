'use client';

import { useEffect } from 'react';
import settingsStore from '@/app/stores/settingsStore';
import { ReactFlowProvider } from '@xyflow/react';
import GraphBoard from '@/app/lib/components/board/graph/graphBoard';
import { GraphBoardProvider } from '@/app/lib/components/board/graph/graphBoardContext';

export default function GraphBoardClientWrapper() {
  useEffect(() => {
    settingsStore.endLoading();
  }, []);

  return (
    <ReactFlowProvider>
      <GraphBoardProvider>
        <GraphBoard />
      </GraphBoardProvider>
    </ReactFlowProvider>
  );
}

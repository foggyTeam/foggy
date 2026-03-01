'use client';

import '@xyflow/react/dist/style.css';
import { observer } from 'mobx-react-lite';
import { Background, Controls, ReactFlow } from '@xyflow/react';
import graphBoardStore from '@/app/stores/board/graphBoardStore';

const GraphBoard = observer(() => {
  return (
    <div
      data-testid="graph-board"
      className="relative h-full w-full overflow-hidden"
    >
      <ReactFlow
        nodes={graphBoardStore.boardNodes}
        edges={graphBoardStore.boardEdges}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
});

export default GraphBoard;

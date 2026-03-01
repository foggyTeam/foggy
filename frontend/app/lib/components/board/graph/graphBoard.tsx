'use client';

import '@xyflow/react/dist/style.css';
import { observer } from 'mobx-react-lite';
import type { Edge, Node } from '@xyflow/react';
import { Background, Controls, ReactFlow } from '@xyflow/react';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import { computed } from 'mobx';

const GraphBoard = observer(() => {
  const nodes = computed(() => graphBoardStore.boardNodes as Node[]);
  const edges = computed(() => graphBoardStore.boardEdges as Edge[]);

  return (
    <div
      data-testid="graph-board"
      className="relative h-full w-full overflow-hidden"
    >
      <ReactFlow nodes={nodes.get()} edges={edges.get()} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
});

export default GraphBoard;

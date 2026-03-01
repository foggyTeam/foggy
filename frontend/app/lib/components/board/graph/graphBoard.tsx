'use client';

import '@xyflow/react/dist/style.css';
import { observer } from 'mobx-react-lite';
import { Background, Controls, ReactFlow } from '@xyflow/react';
import { useState } from 'react';
import useInternalUpdates from '@/app/lib/hooks/graphBoard/useInternalUpdates';
import useExternalUpdates from '@/app/lib/hooks/graphBoard/useExternalUpdates';

const GraphBoard = observer(() => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const { onNodesChange, onEdgesChange } = useInternalUpdates({
    setNodes,
    setEdges,
  });
  useExternalUpdates({
    setNodes,
    setEdges,
  });

  return (
    <div
      data-testid="graph-board"
      className="relative h-full w-full overflow-hidden"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
});

export default GraphBoard;

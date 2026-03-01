'use client';

import '@xyflow/react/dist/style.css';
import { observer } from 'mobx-react-lite';
import { Background, Controls, ReactFlow } from '@xyflow/react';
import { useMemo, useState } from 'react';
import useInternalUpdates from '@/app/lib/hooks/graphBoard/useInternalUpdates';
import useExternalUpdates from '@/app/lib/hooks/graphBoard/useExternalUpdates';

const GraphBoard = observer(() => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const nodesMap = useMemo(() => {
    const map = new Map<string, number>();
    nodes.forEach((node, index) => map.set(node.id, index));
    return map;
  }, [nodes]);
  const edgesMap = useMemo(() => {
    const map = new Map<string, number>();
    edges.forEach((edge, index) => map.set(edge.id, index));
    return map;
  }, [edges]);

  const getNodeById = (id: string) => nodes[nodesMap.get(id)];
  const getEdgeById = (id: string) => edges[edgesMap.get(id)];

  const { onNodesChange, onEdgesChange, onNodesLockChange, onEdgesLockChange } =
    useInternalUpdates({
      setNodes,
      setEdges,
      getNodeById,
      getEdgeById,
    });
  useExternalUpdates({
    setNodes,
    setEdges,
    onEdgesLockChange,
    onNodesLockChange,
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

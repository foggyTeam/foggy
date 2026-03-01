'use client';

import '@xyflow/react/dist/style.css';
import { observer } from 'mobx-react-lite';
import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  ReactFlow,
} from '@xyflow/react';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import throttle from 'lodash/throttle';

const GraphBoard = observer(() => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    setNodes(graphBoardStore.boardNodes || []);
    setEdges(graphBoardStore.boardEdges || []);
  }, [graphBoardStore.boardNodes, graphBoardStore.boardEdges]);

  const throttledNodesUpdate = useMemo(
    () => throttle(graphBoardStore.updateNodes, 640),
    [],
  );
  const throttledEdgesUpdate = useMemo(
    () => throttle(graphBoardStore.updateEdges, 640),
    [],
  );

  const onNodesChange = useCallback(
    (changes) =>
      setNodes((nodesSnapshot) => {
        const updated = applyNodeChanges(changes, nodesSnapshot);
        throttledNodesUpdate(updated);
        return updated;
      }),
    [throttledNodesUpdate],
  );
  const onEdgesChange = useCallback(
    (changes) =>
      setEdges((edgesSnapshot) => {
        const updated = applyEdgeChanges(changes, edgesSnapshot);
        throttledEdgesUpdate(updated);
        return updated;
      }),
    [throttledEdgesUpdate],
  );

  return (
    <div
      data-testid="graph-board"
      className="relative h-full w-full overflow-hidden"
    >
      <ReactFlow
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodes={nodes}
        edges={edges}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
});

export default GraphBoard;

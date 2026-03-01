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

  useEffect(
    () => batchedExternalUpdate('nodes'),
    [graphBoardStore.nodesApplyUpdatesTrigger],
  );
  useEffect(
    () => batchedExternalUpdate('edges'),
    [graphBoardStore.edgesApplyUpdatesTrigger],
  );

  const handleExternalUpdate = (updateType: 'nodes' | 'edges') => {
    const queue =
      updateType === 'nodes'
        ? graphBoardStore.nodesExternalUpdatesQueue
        : graphBoardStore.edgesExternalUpdatesQueue;
    graphBoardStore.clearUpdatesQueue(updateType);
    // TODO: batch updates
    const batchedChanges = [];
    if (updateType === 'nodes') onNodesChange(batchedChanges, true);
    else onEdgesChange(batchedChanges, true);
  };

  const batchedExternalUpdate = useMemo(
    () => throttle(handleExternalUpdate, 640),
    [],
  );

  const throttledNodesUpdate = useMemo(
    () => throttle(graphBoardStore.updateNodes, 640),
    [],
  );
  const throttledEdgesUpdate = useMemo(
    () => throttle(graphBoardStore.updateEdges, 640),
    [],
  );
  const throttledEmitChanges = useMemo(
    () => throttle(graphBoardStore.emitUpdates, 100),
    [],
  );

  const onNodesChange = useCallback(
    (changes, external: boolean = false) =>
      setNodes((nodesSnapshot) => {
        const updated = applyNodeChanges(changes, nodesSnapshot);
        throttledNodesUpdate(updated);
        if (!external) throttledEmitChanges('nodesUpdate', changes);
        return updated;
      }),
    [throttledNodesUpdate, throttledEmitChanges],
  );
  const onEdgesChange = useCallback(
    (changes, external: boolean = false) =>
      setEdges((edgesSnapshot) => {
        const updated = applyEdgeChanges(changes, edgesSnapshot);
        throttledEdgesUpdate(updated);
        if (!external) throttledEmitChanges('edgesUpdate', changes);
        return updated;
      }),
    [throttledEdgesUpdate, throttledEmitChanges],
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

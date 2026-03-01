'use client';

import '@xyflow/react/dist/style.css';
import { observer } from 'mobx-react-lite';
import type { EdgeChange, NodeChange } from '@xyflow/react';
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
import batchGraphUpdates from '@/app/lib/utils/batchGraphUpdates';

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

  // INITIAL STATE
  useEffect(() => {
    setNodes(graphBoardStore.boardNodes ?? []);
    setEdges(graphBoardStore.boardEdges ?? []);
  }, [graphBoardStore.boardNodes, graphBoardStore.boardEdges]);

  // EMITTERS
  const throttledEmitNodes = useMemo(
    () =>
      throttle(
        (changes: NodeChange[]) =>
          graphBoardStore.emitUpdates('nodesUpdate', changes),
        100,
      ),
    [],
  );
  const throttledEmitEdges = useMemo(
    () =>
      throttle(
        (changes: EdgeChange[]) =>
          graphBoardStore.emitUpdates('edgesUpdate', changes),
        100,
      ),
    [],
  );

  // LOCAL HANDLERS
  const onNodesChange = useCallback(
    (changes: NodeChange[], external?: boolean) => {
      setNodes((prev) => applyNodeChanges(changes, prev));
      if (!external) throttledEmitNodes(changes);
    },
    [throttledEmitNodes],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[], external?: boolean) => {
      setEdges((prev) => applyEdgeChanges(changes, prev));
      if (!external) throttledEmitEdges(changes);
    },
    [throttledEmitEdges],
  );
  const onNodesLockChange = (changes: { id: string; lock: boolean }[]) => {
    onNodesChange(
      changes.map((change) => {
        return {
          type: 'replace',
          item: {
            ...nodes[nodesMap.get(change.id)],
            connectable: change.lock,
            draggable: change.lock,
            selectable: change.lock,
          },
        } as NodeChange;
      }),
      true,
    );
  };
  const onEdgesLockChange = (changes: { id: string; lock: boolean }[]) => {
    onEdgesChange(
      changes.map((change) => {
        return {
          type: 'replace',
          item: {
            ...edges[edgesMap.get(change.id)],
            connectable: change.lock,
            draggable: change.lock,
            selectable: change.lock,
          },
        } as EdgeChange;
      }),
      true,
    );
  };

  // EXTERNAL HANDLERS
  const onExternalNodesChange = useMemo(
    () =>
      throttle(() => {
        const queue = graphBoardStore.nodesExternalUpdatesQueue;
        if (queue.length === 0) return;
        graphBoardStore.clearUpdatesQueue('nodes');
        const { changes, lockUpdates } = batchGraphUpdates(queue);
        setNodes((prev) => applyNodeChanges(changes, prev));
        onNodesLockChange(lockUpdates);
      }, 640),
    [],
  );

  const onExternalEdgesChange = useMemo(
    () =>
      throttle(() => {
        const queue = graphBoardStore.edgesExternalUpdatesQueue;
        if (queue.length === 0) return;
        graphBoardStore.clearUpdatesQueue('edges');
        const { changes, lockUpdates } = batchGraphUpdates(queue);
        setEdges((prev) => applyEdgeChanges(changes, prev));
        onEdgesLockChange(lockUpdates);
      }, 640),
    [],
  );

  // EXTERNAL UPDATES WATCHERS
  useEffect(() => {
    onExternalNodesChange();
  }, [graphBoardStore.nodesApplyUpdatesTrigger, onExternalNodesChange]);

  useEffect(() => {
    onExternalEdgesChange();
  }, [graphBoardStore.edgesApplyUpdatesTrigger, onExternalEdgesChange]);

  // CLEANUP
  useEffect(() => {
    return () => {
      throttledEmitNodes.cancel();
      throttledEmitEdges.cancel();
      onExternalNodesChange.cancel();
      onExternalEdgesChange.cancel();
    };
  }, [
    throttledEmitNodes,
    throttledEmitEdges,
    onExternalNodesChange,
    onExternalEdgesChange,
  ]);

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

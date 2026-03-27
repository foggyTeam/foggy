'use client';

import { useEffect, useMemo } from 'react';
import throttle from 'lodash/throttle';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import batchGraphUpdates from '@/app/lib/utils/batchGraphUpdates';
import { applyEdgeChanges, applyNodeChanges } from '@xyflow/react';

function applyLockUpdates<T extends { id: string }>(
  items: T[],
  lockUpdates: { id: string; lock: boolean }[],
): T[] {
  if (lockUpdates.length === 0) return items;
  const lockMap = new Map(
    lockUpdates.map((update) => [update.id, update.lock]),
  );

  return items.map((item) => {
    const lock: boolean | undefined = lockMap.get(item.id);
    if (lock === undefined) return item;
    return {
      ...item,
      draggable: !lock,
      selectable: !lock,
      connectable: !lock,
    };
  });
}

export default function useExternalUpdates(setNodes, setEdges) {
  // UPDATES HANDLERS
  const onExternalNodesChange = useMemo(
    () =>
      throttle(() => {
        const queue = graphBoardStore.nodesExternalUpdatesQueue;
        graphBoardStore.clearUpdatesQueue('nodes');

        if (queue.length === 0) return;
        const { changes, lockUpdates } = batchGraphUpdates(queue);
        setNodes((prev) => {
          const nodes = applyNodeChanges(changes, prev);
          return applyLockUpdates(nodes, lockUpdates);
        });
      }, 640),
    [],
  );

  const onExternalEdgesChange = useMemo(
    () =>
      throttle(() => {
        const queue = graphBoardStore.edgesExternalUpdatesQueue;
        graphBoardStore.clearUpdatesQueue('edges');
        if (queue.length === 0) return;

        const { changes, lockUpdates } = batchGraphUpdates(queue);
        setEdges((prev) => {
          const edges = applyEdgeChanges(changes, prev);
          return applyLockUpdates(edges, lockUpdates);
        });
      }, 640),
    [],
  );

  // UPDATES WATCHERS
  useEffect(() => {
    onExternalNodesChange();
  }, [graphBoardStore.nodesApplyUpdatesTrigger, onExternalNodesChange]);

  useEffect(() => {
    onExternalEdgesChange();
  }, [graphBoardStore.edgesApplyUpdatesTrigger, onExternalEdgesChange]);

  // CLEANUP
  useEffect(() => {
    return () => {
      onExternalNodesChange.cancel();
      onExternalEdgesChange.cancel();
    };
  }, [onExternalNodesChange, onExternalEdgesChange]);
}

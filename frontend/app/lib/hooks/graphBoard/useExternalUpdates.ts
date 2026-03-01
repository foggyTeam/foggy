'use client';

import { useEffect, useMemo } from 'react';
import throttle from 'lodash/throttle';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import batchGraphUpdates from '@/app/lib/utils/batchGraphUpdates';
import { applyEdgeChanges, applyNodeChanges } from '@xyflow/react';

interface ExternalUpdatesParams {
  setNodes: (value: ((prevState: any[]) => any[]) | any[]) => void;
  setEdges: (value: ((prevState: any[]) => any[]) | any[]) => void;
  onEdgesLockChange: (changes: { id: string; lock: boolean }[]) => void;
  onNodesLockChange: (changes: { id: string; lock: boolean }[]) => void;
}

export default function useExternalUpdates({
  setNodes,
  setEdges,
  onEdgesLockChange,
  onNodesLockChange,
}: ExternalUpdatesParams) {
  // UPDATES HANDLERS
  const onExternalNodesChange = useMemo(
    () =>
      throttle(() => {
        const queue = graphBoardStore.nodesExternalUpdatesQueue;
        graphBoardStore.clearUpdatesQueue('nodes');

        if (queue.length === 0) return;
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
        graphBoardStore.clearUpdatesQueue('edges');
        if (queue.length === 0) return;

        const { changes, lockUpdates } = batchGraphUpdates(queue);
        setEdges((prev) => applyEdgeChanges(changes, prev));
        onEdgesLockChange(lockUpdates);
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

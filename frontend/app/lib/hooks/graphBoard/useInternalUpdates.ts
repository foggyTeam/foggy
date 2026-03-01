'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import throttle from 'lodash/throttle';
import {
  applyEdgeChanges,
  applyNodeChanges,
  EdgeChange,
  NodeChange,
} from '@xyflow/react';
import graphBoardStore from '@/app/stores/board/graphBoardStore';

interface InternalUpdatesParams {
  setNodes: (value: ((prevState: any[]) => any[]) | any[]) => void;
  setEdges: (value: ((prevState: any[]) => any[]) | any[]) => void;
}

export default function useInternalUpdates({
  setNodes,
  setEdges,
}: InternalUpdatesParams) {
  const pendingNodeChanges = useRef<NodeChange[]>([]);
  const pendingEdgeChanges = useRef<EdgeChange[]>([]);

  // FLUSHED EMITTERS
  const flushNodeEmit = useMemo(
    () =>
      throttle(() => {
        if (pendingNodeChanges.current.length === 0) return;
        graphBoardStore.emitUpdates('nodesUpdate', pendingNodeChanges.current);
        pendingNodeChanges.current = [];
      }, 100),
    [],
  );

  const flushEdgeEmit = useMemo(
    () =>
      throttle(() => {
        if (pendingEdgeChanges.current.length === 0) return;
        graphBoardStore.emitUpdates('edgesUpdate', pendingEdgeChanges.current);
        pendingEdgeChanges.current = [];
      }, 100),
    [],
  );

  // UPDATES HANDLERS
  const onNodesChange = useCallback(
    (changes: NodeChange[], external?: boolean) => {
      setNodes((prev) => applyNodeChanges(changes, prev));
      if (!external) {
        pendingNodeChanges.current.push(...changes);
        flushNodeEmit();
      }
    },
    [flushNodeEmit],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[], external?: boolean) => {
      setEdges((prev) => applyEdgeChanges(changes, prev));
      if (!external) {
        pendingEdgeChanges.current.push(...changes);
        flushEdgeEmit();
      }
    },
    [flushEdgeEmit],
  );

  // INITIAL STATE WATCHER
  useEffect(() => {
    setNodes(graphBoardStore.boardNodes ?? []);
    setEdges(graphBoardStore.boardEdges ?? []);
  }, [graphBoardStore.boardNodes, graphBoardStore.boardEdges]);

  // CLEANUP
  useEffect(() => {
    return () => {
      flushEdgeEmit.cancel();
      flushNodeEmit.cancel();
    };
  }, [flushEdgeEmit, flushNodeEmit]);

  return { onNodesChange, onEdgesChange };
}

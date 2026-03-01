'use client';

import { useCallback, useEffect, useMemo } from 'react';
import throttle from 'lodash/throttle';
import {
  applyEdgeChanges,
  applyNodeChanges,
  EdgeChange,
  type Node,
  NodeChange,
} from '@xyflow/react';
import graphBoardStore from '@/app/stores/board/graphBoardStore';

interface InternalUpdatesParams {
  setNodes: (value: ((prevState: any[]) => any[]) | any[]) => void;
  setEdges: (value: ((prevState: any[]) => any[]) | any[]) => void;
  getNodeById: (id: string) => Node;
  getEdgeById: (id: string) => Node;
}

export default function useInternalUpdates({
  setNodes,
  setEdges,
  getNodeById,
  getEdgeById,
}: InternalUpdatesParams) {
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

  // UPDATES HANDLERS
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
            ...getNodeById(change.id),
            connectable: !change.lock,
            draggable: !change.lock,
            selectable: !change.lock,
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
            ...getEdgeById(change.id),
            connectable: !change.lock,
            draggable: !change.lock,
            selectable: !change.lock,
          },
        } as EdgeChange;
      }),
      true,
    );
  };

  // INITIAL STATE WATCHER
  useEffect(() => {
    setNodes(graphBoardStore.boardNodes ?? []);
    setEdges(graphBoardStore.boardEdges ?? []);
  }, [graphBoardStore.boardNodes, graphBoardStore.boardEdges]);

  // CLEANUP
  useEffect(() => {
    return () => {
      throttledEmitNodes.cancel();
      throttledEmitEdges.cancel();
    };
  }, [throttledEmitNodes, throttledEmitEdges]);

  return { onNodesChange, onNodesLockChange, onEdgesChange, onEdgesLockChange };
}

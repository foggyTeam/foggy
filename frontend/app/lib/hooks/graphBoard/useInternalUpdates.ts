'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import throttle from 'lodash/throttle';
import {
  applyEdgeChanges,
  applyNodeChanges,
  EdgeChange,
  Node,
  NodeChange,
} from '@xyflow/react';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import { GEdge } from '@/app/lib/types/definitions';
import applyGraphNodeChange from '@/app/lib/utils/applyGraphNodeChange';

interface InternalUpdatesParams {
  setNodes: (value: ((prevState: any[]) => any[]) | any[]) => void;
  setEdges: (value: ((prevState: any[]) => any[]) | any[]) => void;
  updateNode: (
    id: string,
    nodeUpdater: (node: Node) => Partial<Node>,
    options?: { replace: boolean },
  ) => void;
}

const structureChangesTypes: Set<NodeChange['type']> = new Set([
  'add',
  'remove',
]);

export default function useInternalUpdates({
  setNodes,
  setEdges,
  updateNode,
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
      const structureChanges: NodeChange[] = [];
      for (const change of changes) {
        if (structureChangesTypes.has(change.type))
          structureChanges.push(change);
        else {
          updateNode(change.id, applyGraphNodeChange(change), {
            replace: change.type === 'replace',
          });
        }
      }

      if (!structureChanges.length) return;

      setNodes((prev) => applyNodeChanges(structureChanges, prev));
      if (!external) {
        pendingNodeChanges.current.push(...changes);
        flushNodeEmit();
      }
    },
    [flushNodeEmit, updateNode],
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
  const onEdgeUpdate = useCallback(
    (edgeId: string, updatedEdge: GEdge) => {
      const change: EdgeChange = {
        type: 'replace',
        id: edgeId,
        item: updatedEdge,
      };
      setEdges((prev) => applyEdgeChanges([change], prev));

      pendingEdgeChanges.current.push(change);
      flushEdgeEmit();
    },
    [flushEdgeEmit],
  );

  // CLEANUP
  useEffect(() => {
    return () => {
      flushEdgeEmit.cancel();
      flushNodeEmit.cancel();
    };
  }, [flushEdgeEmit, flushNodeEmit]);

  return { onNodesChange, onEdgesChange, onEdgeUpdate };
}

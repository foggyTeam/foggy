'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import throttle from 'lodash/throttle';
import {
  EdgeAddChange,
  EdgeChange,
  EdgeRemoveChange,
  NodeAddChange,
  NodeChange,
  NodeRemoveChange,
} from '@xyflow/react';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import { GEdge, GNode } from '@/app/lib/types/definitions';

type ItemAction<T extends { id: GEdge['id'] | GNode['id'] }> =
  | { type: 'add'; newItem: T; external?: boolean }
  | { type: 'remove'; id: T['id']; external?: boolean };

export default function useInternalUpdates(
  getNode,
  updateNode,
  addNodes,
  getEdge,
  updateEdge,
  addEdges,
  deleteElements,
) {
  const selectedSet = useRef(new Set<string>()); // stores last selection as set of `edge|node-{id}` strings

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
  const onNodeAction = (action: ItemAction<GNode>) => {
    let change: NodeAddChange | NodeRemoveChange;
    switch (action.type) {
      case 'add':
        addNodes([action.newItem]);
        change = { type: 'add', item: action.newItem };
        break;
      case 'remove':
        deleteElements({ nodes: [{ id: action.id }] });
        change = { type: 'remove', id: action.id };
        break;
    }
    if (!action.external) {
      pendingNodeChanges.current.push(change);
      flushNodeEmit();
    }
  };
  const onNodeUpdate = useCallback(
    (nodeId: string, updatedNode: GNode) => {
      const changes: NodeChange[] = [];

      changes.push({
        type: 'position',
        id: nodeId,
        position: updatedNode.position,
        dragging: false,
      });

      if (updatedNode.selected !== undefined) {
        changes.push({
          type: 'select',
          id: nodeId,
          selected: updatedNode.selected,
        });
      }
      pendingNodeChanges.current.push(...changes);
      flushNodeEmit();
    },
    [flushNodeEmit],
  );
  const onEdgeAction = (action: ItemAction<GEdge>) => {
    let change: EdgeAddChange | EdgeRemoveChange;
    switch (action.type) {
      case 'add':
        addEdges([action.newItem]);
        change = { type: 'add', item: action.newItem };
        break;
      case 'remove':
        deleteElements({ edges: [{ id: action.id }] });
        change = { type: 'remove', id: action.id };
        break;
    }
    if (!action.external) {
      pendingEdgeChanges.current.push(change);
      flushEdgeEmit();
    }
  };
  const onEdgeUpdate = useCallback(
    (edgeId: string, updatedEdge: GEdge) => {
      updateEdge(edgeId, updatedEdge);
      const change: EdgeChange = {
        type: 'replace',
        id: edgeId,
        item: updatedEdge,
      };

      pendingEdgeChanges.current.push(change);
      flushEdgeEmit();
    },
    [flushEdgeEmit],
  );

  const emitSelectionChange = ({ nodes, edges }) => {
    const newSelected = new Set<string>();
    nodes.forEach((node) => newSelected.add(`node-${node.id}`));
    edges.forEach((edge) => newSelected.add(`edge-${edge.id}`));

    const all: Set<string> = newSelected.union(selectedSet.current);

    all.forEach((key) => {
      const [type, id] = key.split('-');
      const selected = newSelected.has(key);
      switch (type) {
        case 'node':
          onNodeUpdate(id, {
            ...getNode(id),
            selected,
          } as GNode);
          break;
        case 'edge':
          onEdgeUpdate(id, {
            ...getEdge(id),
            selected,
          } as GEdge);
      }
    });
    selectedSet.current = newSelected;
  };

  // CLEANUP
  useEffect(() => {
    return () => {
      flushEdgeEmit.cancel();
      flushNodeEmit.cancel();
    };
  }, [flushEdgeEmit, flushNodeEmit]);

  return {
    onNodeAction,
    onNodeUpdate,
    onEdgeAction,
    onEdgeUpdate,
    emitSelectionChange,
  };
}

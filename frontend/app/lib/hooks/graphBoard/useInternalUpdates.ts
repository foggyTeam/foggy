'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import throttle from 'lodash/throttle';
import {
  Connection,
  EdgeAddChange,
  EdgeChange,
  EdgeRemoveChange,
  NodeAddChange,
  NodeChange,
  NodeRemoveChange,
  useReactFlow,
} from '@xyflow/react';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import { GEdge, GNode } from '@/app/lib/types/definitions';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';
import debounce from 'lodash/debounce';

type ItemAction<T extends { id: GEdge['id'] | GNode['id'] }> =
  | { type: 'add'; newItem: T; external?: boolean }
  | { type: 'remove'; id: T['id']; external?: boolean };

export default function useInternalUpdates() {
  const {
    createNewElement,
    createNewEdge,
    activeTool,
    setActiveTool,
    isDuplicatedEdge,
    selectedElementsRef,
  } = useGraphBoardContext();
  const {
    getNode,
    addNodes,
    getEdge,
    updateEdge,
    addEdges,
    deleteElements,
    getNodes,
  } = useReactFlow();

  const pendingNodeChanges = useRef<NodeChange[]>([]);
  const pendingEdgeChanges = useRef<EdgeChange[]>([]);

  const debouncedClearNodesData = useCallback(
    debounce(() => {
      graphBoardStore.clearRemovedNodes(getNodes() as GNode[]);
    }, 512) as any,
    [graphBoardStore.clearRemovedNodes],
  );

  // FLUSHED EMITTERS
  const flushNodeEmit = useMemo(
    () =>
      throttle(() => {
        if (pendingNodeChanges.current.length === 0) return;
        graphBoardStore.emitUpdates('nodesUpdate', pendingNodeChanges.current);
        pendingNodeChanges.current = [];
      }, 100),
    [graphBoardStore.emitUpdates],
  );
  const flushEdgeEmit = useMemo(
    () =>
      throttle(() => {
        if (pendingEdgeChanges.current.length === 0) return;
        graphBoardStore.emitUpdates('edgesUpdate', pendingEdgeChanges.current);
        pendingEdgeChanges.current = [];
      }, 100),
    [graphBoardStore.emitUpdates],
  );

  // UPDATES HANDLERS
  const onNodeAction = useCallback(
    (action: ItemAction<GNode>) => {
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
    },
    [addEdges, deleteElements, flushEdgeEmit],
  );
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
  const onEdgeAction = useCallback(
    (action: ItemAction<GEdge>) => {
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
    },
    [addEdges, deleteElements, flushEdgeEmit],
  );
  const onEdgeUpdate = useCallback(
    (edgeId: string, updatedEdge: GEdge) => {
      updateEdge(edgeId, updatedEdge); // used for reconnections
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
  const emitSelectionChange = useCallback(
    ({ nodes, edges }) => {
      const newSelected = new Set<string>();
      nodes.forEach((node) => newSelected.add(`node|${node.id}`));
      edges.forEach((edge) => newSelected.add(`edge|${edge.id}`));

      const all: Set<string> = newSelected.union(selectedElementsRef.current);

      all.forEach((key) => {
        const [type, id] = key.split('|');
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
    },
    [onNodeUpdate, onEdgeUpdate, getNode, getEdge],
  );

  // ACTIONS
  const createNode = useCallback(
    (e: MouseEvent) => {
      const newElement = createNewElement(e, activeTool);
      if (!newElement) return;

      const success = graphBoardStore.updateNodeData(
        newElement.id,
        newElement.data,
        true,
      );
      if (success) onNodeAction({ type: 'add', newItem: newElement });

      setActiveTool(undefined);
      debouncedClearNodesData();
    },
    [
      createNewElement,
      onNodeAction,
      setActiveTool,
      debouncedClearNodesData,
      graphBoardStore.updateNodeData,
    ],
  );
  const createEdge = useCallback(
    (connection: Connection) => {
      const edge = createNewEdge(connection);
      if (!edge) return;

      onEdgeAction({
        type: 'add',
        newItem: edge,
      });
    },
    [createNewEdge, onEdgeAction],
  );
  const reconnectEdge = useCallback(
    (oldEdge: GEdge, newConnection: Connection) => {
      if (isDuplicatedEdge(newConnection)) return;

      onEdgeUpdate(oldEdge.id, {
        ...oldEdge,
        ...newConnection,
      } as GEdge);
    },
    [isDuplicatedEdge, onEdgeUpdate],
  );

  // CLEANUP
  useEffect(() => {
    return () => {
      flushEdgeEmit.cancel();
      flushNodeEmit.cancel();
      debouncedClearNodesData.cancel();
    };
  }, [flushEdgeEmit, flushNodeEmit, debouncedClearNodesData]);

  return {
    createNode,
    createEdge,
    reconnectEdge,
    onNodeAction,
    onNodeUpdate,
    onEdgeAction,
    onEdgeUpdate,
    emitSelectionChange,
  };
}

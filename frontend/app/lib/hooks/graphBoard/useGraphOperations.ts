'use client';

import { GBaseNode, GEdge, GNode } from '@/app/lib/types/definitions';
import { MouseEvent, RefObject, useCallback, useEffect, useMemo } from 'react';
import debounce from 'lodash/debounce';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import { GraphTool } from '@/app/lib/components/board/graph/graphBoardContext';
import { Connection, useReactFlow } from '@xyflow/react';

export default function useGraphOperations(
  selectedElements: RefObject<Set<string>>,
  isDisabled: boolean,
) {
  const { screenToFlowPosition, deleteElements, getEdges } = useReactFlow();

  const createNewElement = (
    e: MouseEvent,
    tool: GraphTool | undefined,
  ): GNode | null => {
    if (!tool || isDisabled) return null;

    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    let newNode: GBaseNode = {
      id: `${tool}-${Date.now().toString()}`,
      position,
      type: '',
      data: {},
      hidden: false,
    };
    switch (tool) {
      case 'external-link':
        newNode.type = 'externalLinkNode';
        break;
      case 'custom-node':
        newNode.type = 'customNode';
        newNode.data = { shape: 'rect', align: 'start' };
        break;
      case 'internal-link':
        newNode.type = 'internalLinkNode';
        break;
      case 'node-link':
        newNode.type = 'nodeLinkNode';
        break;
    }
    return newNode as GNode;
  };
  const createNewEdge = (connection: Connection): GEdge | null => {
    if (isDuplicatedEdge(connection)) return null;

    const newEdge = {
      ...connection,
      style: { strokeWidth: 1.5 },
      id: `${connection.source}-${connection.target}-${Date.now().toString()}`,
      type: 'default',
    };

    return newEdge as GEdge;
  };

  const updateElement = useMemo(
    () =>
      debounce(
        (elementId: GNode['id'], newAttrs: Partial<GNode['data']>) =>
          graphBoardStore.updateNodeData(elementId, newAttrs),
        256,
      ),
    [graphBoardStore.updateNodeData],
  );

  const deleteSelectedElements = useCallback(async () => {
    if (isDisabled) return;

    const edges: Pick<GEdge, 'id'>[] = [];
    const nodes: Pick<GNode, 'id'>[] = [];
    selectedElements.current.forEach((key) => {
      const [type, id] = key.split('|');
      if (type === 'edge') edges.push({ id });
      else nodes.push({ id });
    });
    await deleteElements({ nodes, edges });
  }, [deleteElements, isDisabled]);
  const deleteNode = useCallback(
    async (id: GNode['id']) => {
      if (isDisabled) return;
      await deleteElements({ nodes: [{ id }] });
    },
    [deleteElements, isDisabled],
  );

  const isDuplicatedEdge = useCallback(
    (connection: Connection) => {
      return getEdges().some(
        (edge) =>
          edge.source === connection.source &&
          edge.target === connection.target &&
          edge.sourceHandle === connection.sourceHandle &&
          edge.targetHandle === connection.targetHandle,
      );
    },
    [getEdges],
  );

  useEffect(() => {
    return () => updateElement.cancel();
  }, [updateElement]);

  return {
    updateElement,
    createNewElement,
    createNewEdge,
    deleteSelectedElements,
    deleteNode,
    isDuplicatedEdge,
  };
}

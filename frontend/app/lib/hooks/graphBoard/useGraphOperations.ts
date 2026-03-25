'use client';

import { GBaseNode, GEdge, GNode } from '@/app/lib/types/definitions';
import { useCallback, useEffect, useRef } from 'react';
import debounce from 'lodash/debounce';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import { GraphTool } from '@/app/lib/components/board/graph/graphBoardContext';
import { useReactFlow } from '@xyflow/react';

export default function useGraphOperations(
  selectedElements: (GNode | GEdge)[],
) {
  const { screenToFlowPosition, deleteElements } = useReactFlow();
  const selectedRef = useRef(selectedElements);

  const createNewElement = (
    e: MouseEvent,
    tool: GraphTool | undefined,
  ): GNode | null => {
    if (!tool) return null;

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
  const updateElement = useCallback(
    debounce(
      (elementId: GNode['id'], newAttrs: Partial<GNode['data']>) =>
        graphBoardStore.updateNodeData(elementId, newAttrs),
      256,
    ) as any,
    [],
  );
  const deleteSelectedElements = async () => {
    const edges = selectedRef.current.filter((e) => 'source' in e);
    const nodes = selectedRef.current.slice(edges.length);
    await deleteElements({ nodes, edges });
  };

  useEffect(() => {
    selectedRef.current = selectedElements;
  }, [selectedElements]);

  return { updateElement, createNewElement, deleteSelectedElements };
}

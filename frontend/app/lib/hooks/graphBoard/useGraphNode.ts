'use client';
import { useEffect, useRef, useState } from 'react';
import debounce from 'lodash/debounce';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';

export default function useGraphNode<GNode>(
  nodeId: string,
  hasContent: boolean,
  returnCallback?: () => void,
) {
  const { selectedElements } = useGraphBoardContext();
  const isSelected =
    selectedElements.length === 1 && selectedElements[0].id === nodeId;
  const [isEditing, setIsEditing] = useState(!hasContent);

  const debouncedUpdate = useRef(
    debounce((newAttrs: Partial<GNode>) => {
      graphBoardStore.updateNodeData(nodeId, newAttrs);
    }, 512),
  );

  useEffect(
    () => () => {
      debouncedUpdate.current.cancel();
      returnCallback?.();
    },
    [],
  );

  useEffect(() => {
    if (!isSelected && hasContent) setIsEditing(false);
  }, [isSelected, hasContent]);

  const onBlur = () => {
    if (hasContent) setIsEditing(false);
  };
  const toggleEdit = () => setIsEditing((prev) => !prev);

  return {
    isEditing,
    setIsEditing,
    isSelected,
    onBlur,
    debouncedUpdate,
    toggleEdit,
  };
}

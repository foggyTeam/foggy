'use client';
import { useEffect, useReducer, useRef, useState } from 'react';
import debounce from 'lodash/debounce';
import graphBoardStore from '@/app/stores/board/graphBoardStore';

export default function useGraphNode<T>(
  nodeId: string,
  isSelected: boolean,
  initialData: T,
  hasContent: boolean,
  returnCallback?: () => void,
) {
  const isSynced = useRef(true);
  const [isEditing, setIsEditing] = useState(!hasContent);

  const [nodeState, dispatch] = useReducer((state: T, patch: Partial<T>) => {
    isSynced.current = false;
    return {
      ...state,
      ...patch,
    };
  }, initialData);

  const debouncedUpdate = useRef(
    debounce((newAttrs: Partial<T>) => {
      graphBoardStore.updateNodeData(nodeId, newAttrs);
      isSynced.current = true;
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
  }, [isSelected]);

  useEffect(() => {
    if (isEditing) dispatch(initialData);
  }, [isEditing]);

  useEffect(() => {
    if (!isSynced.current) debouncedUpdate.current(nodeState);
  }, [nodeState]);

  const onBlur = (e) => {
    console.log(e.currentTarget.contains(e.relatedTarget as Element));
    if (hasContent && !e.currentTarget.contains(e.relatedTarget as Element))
      setIsEditing(false);
  };
  const toggleEdit = () => setIsEditing((prev) => !prev);

  return {
    nodeState,
    dispatch,
    isEditing,
    setIsEditing,
    isSelected,
    onBlur,
    debouncedUpdate,
    toggleEdit,
  };
}

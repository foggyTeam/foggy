'use client';
import { useEffect, useReducer, useRef, useState } from 'react';
import debounce from 'lodash/debounce';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import { CopyToClipboard } from '@/app/lib/utils/copyToClipboard';
import { usePathname } from 'next/navigation';

export default function useGraphNode<T>(
  nodeId: string,
  isSelected: boolean | undefined,
  initialData: T,
  hasContent: boolean,
  returnCallback?: () => void,
) {
  const link = `${window.location.origin}${usePathname()}?node_id=${nodeId}`;
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
    if (hasContent && !e.currentTarget.contains(e.relatedTarget as Element))
      setIsEditing(false);
  };
  const toggleEdit = () => setIsEditing((prev) => !prev);
  const onCopyLink = async () => {
    await CopyToClipboard(link);
  };

  return {
    nodeState,
    dispatch,
    isEditing,
    setIsEditing,
    debouncedUpdate,
    onBlur,
    toggleEdit,
    onCopyLink,
  };
}

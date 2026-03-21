'use client';

import NodeWrapper from '@/app/lib/components/board/graph/nodes/nodeWrapper';
import React, { useEffect, useState } from 'react';
import { GCustomNode } from '@/app/lib/types/definitions';
import { observer } from 'mobx-react-lite';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import { Input, Textarea } from '@heroui/input';
import settingsStore from '@/app/stores/settingsStore';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import useGraphNode from '@/app/lib/hooks/graphBoard/useGraphNode';

const CustomNode = observer((node: GCustomNode) => {
  const data: GCustomNode['data'] = graphBoardStore.nodesDataMap?.get(node.id);
  const { smallerSize } = useAdaptiveParams();

  const [title, setTitle] = useState(data.title || '');
  const [description, setDescription] = useState(data.description || '');
  const { isEditing, isSelected, debouncedUpdate, onBlur, toggleEdit } =
    useGraphNode(node.id, !!(data.title || data.description));

  useEffect(() => {
    if (isEditing && title !== data.title) setTitle(data.title || '');
    if (isEditing && description !== data.description)
      setDescription(data.description || '');
  }, [isEditing]);

  useEffect(() => {
    if (data.title !== title) debouncedUpdate.current({ title });
  }, [title]);

  useEffect(() => {
    if (data.description !== description)
      debouncedUpdate.current({ description });
  }, [description]);

  return (
    <NodeWrapper
      isSelected={isSelected}
      onBlur={onBlur}
      toolbarProps={{
        toggleEdit,
      }}
    >
      {!isEditing && (
        <div className="flex flex-col gap-1">
          {data.title && (
            <h1 className="line-clamp-1 w-fit truncate font-medium text-nowrap">
              {data.title}
            </h1>
          )}

          {data.description && (
            <p className="text-default-700 line-clamp-8 h-fit w-full text-start text-xs whitespace-pre-wrap italic">
              {data.description}
            </p>
          )}
        </div>
      )}

      {isEditing && (
        <div
          className="flex flex-col gap-1"
          onKeyDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onBlur={(e) => e.stopPropagation()}
        >
          {/*TODO: add zod rules */}
          <Input
            placeholder={settingsStore.t.toolBar.titlePlaceholder}
            label={settingsStore.t.toolBar.titleLabel}
            type="title"
            value={title}
            onValueChange={setTitle}
            autoFocus
            color="primary"
            variant="underlined"
            size={smallerSize}
            className="w-full"
            classNames={{
              input: 'text-default-500 font-medium',
            }}
          />

          <Textarea
            color="primary"
            variant="underlined"
            maxRows={4}
            rows={1}
            label={settingsStore.t.toolBar.descriptionLabel}
            labelPlacement="inside"
            name="description"
            placeholder={settingsStore.t.toolBar.descriptionPlaceholder}
            type="description"
            autoComplete="description"
            size={smallerSize}
            value={description}
            onValueChange={setDescription}
            classNames={{
              input: 'text-default-500 font-medium',
            }}
          />
        </div>
      )}
    </NodeWrapper>
  );
});

export default CustomNode;

'use client';

import NodeWrapper from '@/app/lib/components/board/graph/nodes/nodeWrapper';
import React, { useCallback } from 'react';
import { GCustomNode } from '@/app/lib/types/definitions';
import { observer } from 'mobx-react-lite';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import { Input, Textarea } from '@heroui/input';
import settingsStore from '@/app/stores/settingsStore';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import useGraphNode from '@/app/lib/hooks/graphBoard/useGraphNode';
import ShapeTool from '@/app/lib/components/board/graph/tools/tooltipTools/shapeTool';
import ShapedUnderlay from '@/app/lib/components/board/graph/nodes/shapedUnderlay';
import GraphColorTool from '@/app/lib/components/board/graph/tools/graphColorTool';
import AlignTool from '@/app/lib/components/board/graph/tools/tooltipTools/alignTool';
import { customNodeSchema } from '@/app/lib/types/schemas';

const shapeStyleMap = {
  rect: '',
  circle: 'shape-circle',
  triangle: 'shape-triangle',
  pentagon: 'shape-pentagon',
  diamond: 'shape-diamond',
};

const alignClassMap = {
  start: 'justify-start text-start',
  center: 'justify-center text-center',
  end: 'justify-end text-end',
};

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

const CustomNode = observer((node: GCustomNode) => {
  const data: GCustomNode['data'] = graphBoardStore.nodesDataMap?.get(node.id);
  const { smallerSize } = useAdaptiveParams();

  const {
    nodeState,
    dispatch,
    errors,
    isEditing,
    onBlur,
    toggleEdit,
    onCopyLink,
  } = useGraphNode<GCustomNode['data']>(
    node.id,
    node.selected,
    data,
    !!(data.title || data.description),
    customNodeSchema,
  );
  const themeClass = data.color
    ? isLightColor(data.color)
      ? ' light'
      : ' dark'
    : '';
  const alignClass = data.align ? alignClassMap[data.align] : '';

  const setTitle = useCallback((v) => dispatch({ title: v }), []);
  const setDescription = useCallback((v) => dispatch({ description: v }), []);
  const setShape = useCallback((v) => dispatch({ shape: v }), []);
  const setColor = useCallback((v) => dispatch({ color: v }), []);
  const setAlign = useCallback((v) => dispatch({ align: v }), []);

  return (
    <NodeWrapper
      isSelected={!!node.selected}
      onBlur={onBlur}
      toolbarProps={{
        onToggleEdit: toggleEdit,
        onCopyNodeLink: onCopyLink,
      }}
      className={shapeStyleMap[data.shape || 'rect'] + themeClass}
      toolbarTools={
        <>
          <ShapeTool shape={data.shape} setShape={setShape} />
          <GraphColorTool color={data.color || ''} setColor={setColor} />
          <AlignTool align={data.align || 'start'} setAlign={setAlign} />
        </>
      }
      underlay={
        <ShapedUnderlay shape={data.shape || 'rect'} color={data.color} />
      }
    >
      {!isEditing && (
        <div className="flex flex-col gap-1">
          {data.title && (
            <h1
              className={`line-clamp-1 flex h-7 w-full items-center truncate font-medium text-nowrap ${alignClass}`}
            >
              {data.title}
            </h1>
          )}

          {data.description && (
            <p
              className={`line-clamp-8 flex h-fit w-full text-xs whitespace-pre-wrap ${alignClass}`}
            >
              {data.description}
            </p>
          )}
        </div>
      )}

      {isEditing && (
        <div
          className="nopan nodrag nowheel flex flex-col gap-1"
          onKeyDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onBlur={onBlur}
        >
          {/*TODO: add zod rules */}
          <Input
            isInvalid={errors.current.title}
            errorMessage={errors.current.title}
            placeholder={settingsStore.t.toolBar.titlePlaceholder}
            label={settingsStore.t.toolBar.titleLabel}
            type="title"
            value={nodeState.title}
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
            isInvalid={errors.current.description}
            errorMessage={errors.current.description}
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
            value={nodeState.description}
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

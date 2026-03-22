'use client';

import NodeWrapper from '@/app/lib/components/board/graph/nodes/nodeWrapper';
import React from 'react';
import { GCustomNode } from '@/app/lib/types/definitions';
import { observer } from 'mobx-react-lite';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import { Input, Textarea } from '@heroui/input';
import settingsStore from '@/app/stores/settingsStore';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import useGraphNode from '@/app/lib/hooks/graphBoard/useGraphNode';
import ShapeTool from '@/app/lib/components/board/graph/tools/shapeTool';
import ShapedUnderlay from '@/app/lib/components/board/graph/nodes/shapedUnderlay';
import clsx from 'clsx';

const shapeStyleMap = {
  rect: '',
  circle: 'shape-circle',
  triangle: 'shape-triangle',
  pentagon: 'shape-pentagon',
  diamond: 'shape-diamond',
};

function getDarkenedColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const factor = 0.3;

  const dr = Math.round(r * factor);
  const dg = Math.round(g * factor);
  const db = Math.round(b * factor);

  return `rgb(${dr}, ${dg}, ${db})`;
}

function getTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  if (luminance > 0.5) return getDarkenedColor(hex);
  else return '#fff';
}

const CustomNode = observer((node: GCustomNode) => {
  const data: GCustomNode['data'] = graphBoardStore.nodesDataMap?.get(node.id);
  const { smallerSize } = useAdaptiveParams();

  const { nodeState, dispatch, isEditing, isSelected, onBlur, toggleEdit } =
    useGraphNode<GCustomNode['data']>(
      node.id,
      data,
      !!(data.title || data.description),
    );

  return (
    <NodeWrapper
      isSelected={isSelected}
      onBlur={onBlur}
      toolbarProps={{
        toggleEdit,
      }}
      className={clsx(
        shapeStyleMap[data.shape || 'rect'],
        data.color && `color-${getTextColor(data.color)}`,
      )}
      toolbarTools={
        <>
          <ShapeTool
            shape={data.shape}
            setShape={(value) => dispatch({ shape: value })}
          />
        </>
      }
      underlay={
        <ShapedUnderlay shape={data.shape || 'rect'} color={data.color} />
      }
    >
      {!isEditing && (
        <div className="flex flex-col gap-1">
          {data.title && (
            <h1 className="line-clamp-1 w-full truncate font-medium text-nowrap">
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
          className="nopan nodrag nowheel flex flex-col gap-1"
          onKeyDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onBlur={(e) => e.stopPropagation()}
        >
          {/*TODO: add zod rules */}
          <Input
            placeholder={settingsStore.t.toolBar.titlePlaceholder}
            label={settingsStore.t.toolBar.titleLabel}
            type="title"
            value={nodeState.title}
            onValueChange={(value) => dispatch({ title: value })}
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
            value={nodeState.description}
            onValueChange={(value) => dispatch({ description: value })}
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

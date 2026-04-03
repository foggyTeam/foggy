'use client';

import NodeWrapper from '@/app/lib/components/board/graph/nodes/nodeWrapper';
import React, { useCallback, useMemo } from 'react';
import { GCustomNode } from '@/app/lib/types/definitions';
import { observer } from 'mobx-react-lite';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import { Input, Textarea } from '@heroui/input';
import settingsStore from '@/app/stores/settingsStore';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import useGraphNode from '@/app/lib/hooks/graphBoard/useGraphNode';
import ShapeTool from '@/app/lib/components/board/graph/tools/tooltipTools/shapeTool';
import ShapedUnderlay from '@/app/lib/components/board/graph/nodes/shapedUnderlay';
import GraphColorTool from '@/app/lib/components/board/graph/tools/tooltipTools/graphColorTool';
import AlignTool from '@/app/lib/components/board/graph/tools/tooltipTools/alignTool';
import { customNodeSchema } from '@/app/lib/types/schemas';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';
import clsx from 'clsx';

type GCustomNodeData = GCustomNode['data'];
const shapeStyleMap: Record<GCustomNodeData['shape'], string> = {
  rect: '',
  circle: 'shape-circle',
  triangle: 'shape-triangle',
  pentagon: 'shape-pentagon',
  diamond: 'shape-diamond',
};

const alignClassMap: Record<GCustomNodeData['align'], string> = {
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
  const data = graphBoardStore.nodesDataMap?.get(node.id) as GCustomNodeData;
  const { smallerSize } = useAdaptiveParams();
  const { allToolsDisabled, toolsDisabled } = useGraphBoardContext();

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
    !!(data?.title || data?.description),
    customNodeSchema,
  );

  const themeClass = useMemo(() => {
    return data?.color ? (isLightColor(data.color) ? ' light' : ' dark') : '';
  }, [data?.color]);

  const alignClass = useMemo(
    () => alignClassMap[data?.align || 'start'],
    [data?.align],
  );

  const shapeClass = useMemo(
    () => shapeStyleMap[data?.shape || 'rect'],
    [data?.shape],
  );

  const setTitle = useCallback(
    (v: GCustomNodeData['title']) => dispatch({ title: v }),
    [dispatch],
  );
  const setDescription = useCallback(
    (v: GCustomNodeData['description']) => dispatch({ description: v }),
    [dispatch],
  );
  const setShape = useCallback(
    (v: GCustomNodeData['shape']) => dispatch({ shape: v }),
    [dispatch],
  );
  const setColor = useCallback(
    (v: GCustomNodeData['color']) => dispatch({ color: v }),
    [dispatch],
  );
  const setAlign = useCallback(
    (v: GCustomNodeData['align']) => dispatch({ align: v }),
    [dispatch],
  );

  const underlay = useMemo(
    () => <ShapedUnderlay shape={data?.shape || 'rect'} color={data?.color} />,
    [data?.shape, data?.color],
  );

  const toolbarTools = useMemo(
    () => (
      <>
        <ShapeTool shape={data?.shape || 'rect'} setShape={setShape} />
        <GraphColorTool color={data?.color || ''} setColor={setColor} />
        <AlignTool align={data?.align || 'start'} setAlign={setAlign} />
      </>
    ),
    [data?.shape, data?.color, data?.align, setShape, setColor, setAlign],
  );

  return (
    <NodeWrapper
      isSelected={!!node.selected}
      onBlur={onBlur}
      toolbarProps={{
        onToggleEdit: toggleEdit,
        onCopyNodeLink: onCopyLink,
      }}
      toolbarTools={toolbarTools}
      className={clsx(shapeClass, themeClass)}
      underlay={underlay}
    >
      {!isEditing && (
        <div className="flex flex-col gap-1">
          {data?.title && (
            <h1
              className={clsx(
                'line-clamp-1 w-full truncate font-medium text-nowrap',
                alignClass,
              )}
            >
              {data.title}
            </h1>
          )}

          {data?.description && (
            <p
              className={clsx(
                'line-clamp-6 h-fit w-full truncate text-xs whitespace-pre-wrap',
                alignClass,
              )}
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
          <Input
            isReadOnly={allToolsDisabled || toolsDisabled || !node.draggable}
            isInvalid={!!errors.current.title}
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
            isReadOnly={allToolsDisabled || toolsDisabled || !node.draggable}
            isInvalid={!!errors.current.description}
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

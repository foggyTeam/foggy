'use client';

import { CircleIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { to_rgb } from '@/tailwind.config';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import ColorPicker from '@/app/lib/components/board/simple/tools/colorPicker';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';
import { GEdge } from '@/app/lib/types/definitions';
import { useState } from 'react';

export default function EdgeColorTool({
  edge,
  onChange,
}: {
  edge: GEdge;
  onChange: (
    patch: Partial<Pick<GEdge, 'style' | 'markerStart' | 'markerEnd'>>,
  ) => void;
}) {
  const { commonSize } = useAdaptiveParams();
  const { allToolsDisabled } = useGraphBoardContext();
  const [color, setColor] = useState(edge.style?.stroke ?? '');

  const onColorChange = (value: string) => {
    if (value === color) return;
    setColor(value);
    const markerStart = edge.markerStart
      ? {
          ...edge.markerStart,
          color: value || 'hsl(var(--heroui-default-400))',
        }
      : undefined;
    const markerEnd = edge.markerEnd
      ? {
          ...edge.markerEnd,
          color: value || 'hsl(var(--heroui-default-400))',
        }
      : undefined;
    onChange({
      style: { ...edge.style, stroke: value || undefined },
      markerStart,
      markerEnd,
    });
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          data-testid="edge-color-tool-btn"
          isDisabled={allToolsDisabled}
          variant="light"
          color="default"
          isIconOnly
          size={commonSize}
        >
          <FTooltip content={settingsStore.t.toolTips.tools.pencilColor}>
            <CircleIcon
              fill={color || 'transparent'}
              stroke={color ? `rgba(${to_rgb(color)}, .48)` : 'currentColor'}
            />
          </FTooltip>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={clsx(
          bg_container_no_padding,
          'flex w-fit flex-col gap-2 px-1 py-2 sm:px-1 sm:py-3',
        )}
      >
        <ColorPicker showClearBtn value={color} changeValue={onColorChange} />
      </PopoverContent>
    </Popover>
  );
}

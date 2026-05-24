'use client';

import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import React, { useState } from 'react';
import RectTool from '@/app/lib/components/board/simple/tools/baseTools/rectTool';
import EllipseTool from '@/app/lib/components/board/simple/tools/baseTools/ellipseTool';
import ElementToolBar from '@/app/lib/components/board/simple/menu/elementToolBar';
import { Divider } from '@heroui/divider';
import TextTool from '@/app/lib/components/board/simple/tools/baseTools/textTool';
import PencilTool from '@/app/lib/components/board/simple/tools/baseTools/pencilTool';
import DeleteTool from '@/app/lib/components/board/simple/tools/baseTools/deleteTool';
import PencilToolBar from '@/app/lib/components/board/simple/menu/pencilToolBar';
import { PencilParams } from '@/app/lib/components/board/simple/tools/drawingHandlers';
import { foggy_accent } from '@/tailwind.config';
import EraserTool from '@/app/lib/components/board/simple/tools/baseTools/eraserTool';
import { useBoardContext } from '@/app/lib/components/board/simple/boardContext';
import { useTheme } from 'next-themes';
import ImageTool from '@/app/lib/components/board/simple/tools/baseTools/imageTool';
import HeartTool from '@/app/lib/components/board/simple/tools/baseTools/heartTool';
import TriangleTool from '@/app/lib/components/board/simple/tools/baseTools/triangleTool';
import StarTool from '@/app/lib/components/board/simple/tools/baseTools/starTool';
import ArrowTool from '@/app/lib/components/board/simple/tools/baseTools/arrowTool';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import { Button } from '@heroui/button';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import settingsStore from '@/app/stores/settingsStore';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { ShapesIcon } from 'lucide-react';

export type ToolProps = {
  isDisabled: boolean;
  activeTool: string;
  setActiveTool: any;
  addElement: any;
  updateElement: any;
  stageRef: any;
  resetStage: any;
  pencilParams?: PencilParams;
};

export default function ToolBar() {
  const { resolvedTheme } = useTheme();
  const { commonSize } = useAdaptiveParams();

  const theme = (resolvedTheme as 'light' | 'dark') ?? 'light';

  const DEFAULT_PENCIL: PencilParams = {
    color: foggy_accent[theme].DEFAULT,
    width: 4,
    tension: 0.4,
    lineJoin: 'round',
    lineCap: 'round',
  };

  const { selectedElement, activeTool } = useBoardContext();
  const tools = [TextTool, PencilTool, EraserTool, ImageTool, ArrowTool];
  const shapeTools = [RectTool, EllipseTool, TriangleTool, StarTool, HeartTool];

  const [pencilParams, setPencilParams] =
    useState<PencilParams>(DEFAULT_PENCIL);

  return (
    <div
      data-testid="board-toolbar"
      className={clsx(
        'absolute right-0 bottom-0 left-0 z-30 w-full justify-self-center px-4 py-3 sm:z-50',
        'sm:right-auto sm:bottom-4 sm:left-auto sm:w-fit sm:rounded-2xl sm:rounded-tr-[64px] sm:px-6',
        bg_container_no_padding,
        'flex flex-col justify-center gap-1 rounded-t-none rounded-l-none rounded-r-none',
        'overflow-visible',
      )}
    >
      {selectedElement && selectedElement?.attrs.type !== 'line' && (
        <ElementToolBar />
      )}
      {(activeTool === 'pencil' ||
        (selectedElement && selectedElement?.attrs.type === 'line')) && (
        <PencilToolBar
          pencilParams={pencilParams}
          setPencilParams={setPencilParams}
        />
      )}
      {(selectedElement || activeTool === 'pencil') && <Divider />}
      <div className="flex justify-center gap-1">
        {tools.map((Tool, index) => (
          <Tool key={index} pencilParams={pencilParams} />
        ))}

        <Popover>
          <PopoverTrigger>
            <Button
              data-testid="shape-tools-btn"
              variant="light"
              color="default"
              isIconOnly
              size={commonSize}
            >
              <FTooltip content={settingsStore.t.toolTips.tools.shapeTools}>
                <ShapesIcon className="stroke-default-600" />
              </FTooltip>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className={clsx(
              bg_container_no_padding,
              'flex w-fit flex-col gap-2 px-1 py-2 sm:px-1 sm:py-3',
            )}
          >
            {shapeTools.map((Tool, index) => (
              <Tool key={index} pencilParams={pencilParams} />
            ))}
          </PopoverContent>
        </Popover>

        {selectedElement && (
          <>
            <Divider orientation="vertical" />
            <DeleteTool />
          </>
        )}
      </div>
    </div>
  );
}

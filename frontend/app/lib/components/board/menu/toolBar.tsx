'use client';

import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import React, { useState } from 'react';
import RectTool from '@/app/lib/components/board/tools/baseTools/rectTool';
import EllipseTool from '@/app/lib/components/board/tools/baseTools/ellipseTool';
import ElementToolBar from '@/app/lib/components/board/menu/elementToolBar';
import { Divider } from '@heroui/divider';
import TextTool from '@/app/lib/components/board/tools/baseTools/textTool';
import PencilTool from '@/app/lib/components/board/tools/baseTools/pencilTool';
import DeleteTool from '@/app/lib/components/board/tools/baseTools/deleteTool';
import PencilToolBar from '@/app/lib/components/board/menu/pencilToolBar';
import { PencilParams } from '@/app/lib/components/board/tools/drawingHandlers';
import { foggy_accent } from '@/tailwind.config';
import EraserTool from '@/app/lib/components/board/tools/baseTools/eraserTool';
import { useBoardContext } from '@/app/lib/components/board/boardContext';
import { useTheme } from 'next-themes';

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
  const { theme } = useTheme();
  const DEFAULT_PENCIL: PencilParams = {
    color: foggy_accent[theme].DEFAULT,
    width: 4,
    tension: 0.4,
    lineJoin: 'round',
    lineCap: 'round',
  };

  const { selectedElement, activeTool } = useBoardContext();
  const tools = [TextTool, PencilTool, EraserTool, RectTool, EllipseTool];

  const [pencilParams, setPencilParams] =
    useState<PencilParams>(DEFAULT_PENCIL);

  return (
    <div
      className={clsx(
        'absolute right-0 bottom-0 left-0 z-50 w-full justify-self-center px-2 py-3',
        'sm:right-auto sm:bottom-4 sm:left-auto sm:w-fit sm:rounded-2xl sm:rounded-tr-[64px] sm:px-6',
        bg_container_no_padding,
        'flex flex-col justify-center gap-1 rounded-none',
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

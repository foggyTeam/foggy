'use client';

import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
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

const DEFAULT_PENCIL: PencilParams = {
  color: foggy_accent.DEFAULT,
  width: 4,
  tension: 0.4,
  lineJoin: 'round',
  lineCap: 'round',
};

export default function ToolBar() {
  const { selectedElement, activeTool } = useBoardContext();
  const tools = [TextTool, PencilTool, EraserTool, RectTool, EllipseTool];

  const [pencilParams, setPencilParams] =
    useState<PencilParams>(DEFAULT_PENCIL);

  return (
    <div
      className={clsx(
        'absolute bottom-0 left-0 right-0 z-50 w-full justify-self-center px-2 py-3',
        'sm:bottom-4 sm:left-auto sm:right-auto sm:w-fit sm:rounded-2xl sm:rounded-tr-[64px] sm:px-6',
        bg_container,
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

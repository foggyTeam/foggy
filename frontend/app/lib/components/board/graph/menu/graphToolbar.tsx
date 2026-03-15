'use client';

import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import React from 'react';
import { PencilParams } from '@/app/lib/components/board/simple/tools/drawingHandlers';
import CustomNodeTool from '@/app/lib/components/board/graph/tools/customNodeTool';

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

export default function GraphToolbar() {
  const tools = [CustomNodeTool];

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
      <div className="flex justify-center gap-1">
        {tools.map((Tool, index) => (
          <Tool key={index} />
        ))}
      </div>
    </div>
  );
}

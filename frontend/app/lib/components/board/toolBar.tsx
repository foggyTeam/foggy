'use client';

import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
import { useState } from 'react';
import RectTool from '@/app/lib/components/board/tools/rectTool';

export default function ToolBar({ stageRef, updateElement, addElement }) {
  const [activeTool, setActiveTool] = useState('');
  const tools = [RectTool];

  return (
    <div
      className={clsx(
        'absolute bottom-0 left-0 right-0 z-50 flex w-full justify-self-center sm:bottom-4 sm:left-auto sm:right-auto sm:w-fit',
        'justify-center gap-1 px-2 py-3 sm:rounded-2xl sm:rounded-tr-[64px] sm:px-6',
        bg_container,
        'rounded-none',
      )}
    >
      <RectTool
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        addElement={addElement}
        updateElement={updateElement}
        stageRef={stageRef}
      />
    </div>
  );
}

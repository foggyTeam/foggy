'use client';

import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
import React, { useState } from 'react';
import RectTool from '@/app/lib/components/board/tools/rectTool';
import EllipseTool from '@/app/lib/components/board/tools/ellipseTool';
import ElementToolBar from '@/app/lib/components/board/menu/elementToolBar';
import { Divider } from '@heroui/divider';
import TextTool from '@/app/lib/components/board/tools/textTool';
import { BoardElement } from '@/app/lib/types/definitions';
import PencilTool from '@/app/lib/components/board/tools/pencilTool';
import DeleteTool from '@/app/lib/components/board/tools/deleteTool';

export type ToolProps = {
  activeTool: string;
  setActiveTool: any;
  addElement: any;
  updateElement: any;
  stageRef: any;
  resetStage: any;
};

export default function ToolBar({
  stageRef,
  updateElement,
  addElement,
  removeElement,
  element,
  resetStage,
}: {
  stageRef: any;
  updateElement: any;
  addElement: any;
  removeElement: any;
  element: BoardElement;
  resetStage: any;
}) {
  const [activeTool, setActiveTool] = useState('');
  const tools = [TextTool, PencilTool, RectTool, EllipseTool];

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
      {element ? (
        <ElementToolBar
          updateElement={updateElement}
          removeElement={removeElement}
          element={element}
        />
      ) : null}
      {element ? <Divider /> : null}
      <div className="flex justify-center gap-1">
        {tools.map((Tool, index) => (
          <Tool
            key={index}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            addElement={addElement}
            updateElement={updateElement}
            stageRef={stageRef}
            resetStage={resetStage}
          />
        ))}

        {element && (
          <>
            <Divider orientation="vertical" />
            <DeleteTool element={element} removeElement={removeElement} />
          </>
        )}
      </div>
    </div>
  );
}

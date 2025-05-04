'use client';

import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
import React, { useEffect, useState } from 'react';
import RectTool from '@/app/lib/components/board/tools/rectTool';
import EllipseTool from '@/app/lib/components/board/tools/ellipseTool';
import ElementToolBar from '@/app/lib/components/board/menu/elementToolBar';
import { Divider } from '@heroui/divider';
import TextTool from '@/app/lib/components/board/tools/textTool';
import { BoardElement } from '@/app/lib/types/definitions';
import PencilTool from '@/app/lib/components/board/tools/pencilTool';
import DeleteTool from '@/app/lib/components/board/tools/deleteTool';
import PencilToolBar from '@/app/lib/components/board/menu/pencilToolBar';
import { PencilParams } from '@/app/lib/components/board/tools/drawingHandlers';
import { foggy_accent } from '@/tailwind.config';

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

  const [pencilParams, setPencilParams] =
    useState<PencilParams>(DEFAULT_PENCIL);

  useEffect(() => {
    if (activeTool !== 'pencil') setPencilParams(DEFAULT_PENCIL);
  }, [activeTool]);

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
      {element &&
        (element?.attrs.type !== 'line' ? (
          <ElementToolBar
            updateElement={updateElement}
            removeElement={removeElement}
            element={element}
          />
        ) : (
          <PencilToolBar
            updateElement={updateElement}
            element={element}
            pencilParams={pencilParams}
          />
        ))}
      {activeTool === 'pencil' && !element && (
        <PencilToolBar
          pencilParams={pencilParams}
          setPencilParams={setPencilParams}
        />
      )}
      {(element || activeTool === 'pencil') && <Divider />}
      <div className="flex justify-center gap-1">
        {tools.map((Tool, index) => (
          <Tool
            isDisabled={!!element}
            key={index}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            addElement={addElement}
            updateElement={updateElement}
            stageRef={stageRef}
            resetStage={resetStage}
            pencilParams={pencilParams}
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

'use client';

import React, { useRef, useState } from 'react';
import { Stage } from 'react-konva';
import GridLayer from '@/app/lib/components/board/gridLayer';
import { Button } from '@heroui/button';
import { BoxSelectIcon } from 'lucide-react';
import { BoardElement } from '@/app/lib/types/definitions';
import BoardLayer from '@/app/lib/components/board/boardLayer';
import UseBoardZoom from '@/app/lib/hooks/useBoardZoom';
import UseBoardNavigation from '@/app/lib/hooks/useBoardNavigation';
import ToolBar from '@/app/lib/components/board/toolBar';
import { observer } from 'mobx-react-lite';
import projectsStore from '@/app/stores/projectsStore';

const GRID_SIZE = 24;
const MAX_X = 1000;
const MAX_Y = 1000;
const MIN_X = -2000;
const MIN_Y = -2000;

export const fitCoordinates = (
  x: number,
  y: number,
  elementWidth: number = 200,
  elementHeight: number = 200,
  scale: number,
) => {
  let newX = x;
  let newY = y;

  if (newX >= MAX_X * scale) {
    newX = MAX_X * scale - 1;
  } else if (newX - elementWidth <= MIN_X * scale) {
    newX = MIN_X * scale + elementWidth + 1;
  }

  if (newY >= MAX_Y * scale) {
    newY = MAX_Y * scale - 1;
  } else if (newY - elementHeight <= MIN_Y * scale) {
    newY = MIN_Y * scale + elementHeight + 1;
  }
  return { x: newX, y: newY };
};

const BoardStage = observer(() => {
  const stageRef: any = useRef(null);
  const [scale, setScale] = useState(1);

  UseBoardNavigation(stageRef, scale);
  UseBoardZoom(stageRef, scale, setScale);

  const resetStage = () => {
    const stage = stageRef.current;
    if (stage) {
      stage.position({ x: 0, y: 0 });
      setScale(1);
      stage.scale({ x: 1, y: 1 });
      stage.batchDraw();
    }
  };

  const updateElement = (id: string, newAttrs: Partial<BoardElement>) => {
    projectsStore.updateElement(id, newAttrs);
  };

  const addElement = (newElement: BoardElement) => {
    projectsStore.addElement(newElement);
  };

  return (
    <>
      <Stage
        width={window?.innerWidth}
        height={window?.innerHeight}
        ref={stageRef}
        onDragMove={null}
        onDragEnd={null}
      >
        <GridLayer stageRef={stageRef} scale={scale} gridSize={GRID_SIZE} />

        {projectsStore.activeBoard?.layers?.map((layer, index) => (
          <BoardLayer
            key={index}
            layer={layer}
            fitCoordinates={(pos, element) =>
              fitCoordinates(pos.x, pos.y, element.width, element.height, scale)
            }
            updateElement={updateElement}
          />
        ))}
      </Stage>
      <div className="flex justify-center">
        <ToolBar
          stageRef={stageRef}
          addElement={addElement}
          updateElement={updateElement}
        />
      </div>
      <Button
        onPress={resetStage}
        isIconOnly
        color="secondary"
        variant="light"
        size="md"
        className="invisible absolute bottom-4 right-16 z-50 font-semibold sm:visible"
      >
        <BoxSelectIcon />
      </Button>
    </>
  );
});

export default BoardStage;

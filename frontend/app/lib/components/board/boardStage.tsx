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

const testBoardLayers = [
  [
    {
      id: 'rect1',
      type: 'rect',
      draggable: true,
      x: 100,
      y: 100,
      rotation: 0,
      fill: 'red',
      width: 200,
      height: 100,
    },
    {
      id: 'line1',
      type: 'line',
      draggable: true,
      x: 50,
      y: 50,
      rotation: 0,
      stroke: 'black',
      points: [0, 0, 100, 100],
      strokeWidth: 2,
    },
    {
      id: 'marker1',
      type: 'marker',
      draggable: true,
      x: 150,
      y: 150,
      rotation: 0,
      stroke: 'purple',
      points: [0, 0, 50, 50, 100, 0],
      strokeWidth: 8,
      opacity: 0.5,
    },
  ],
  [
    {
      id: 'ellipse1',
      type: 'ellipse',
      draggable: true,
      x: 400,
      y: 150,
      rotation: 0,
      fill: 'blue',
      width: 100,
      height: 150,
    },
    {
      id: 'text1',
      type: 'text',
      draggable: true,
      x: 200,
      y: 300,
      rotation: 0,
      color: 'green',
      text: 'Hello, world!',
      fontSize: 24,
    },
  ],
];

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

export default function BoardStage() {
  const stageRef: any = useRef(null);
  const [layers, setLayers] = useState(testBoardLayers as BoardElement[][]);
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

  const updateElement = (id: string, newAttrs: Partial<any>) => {
    setLayers((prevLayers) => {
      const updatedLayers = [...prevLayers];
      updatedLayers.forEach((layer) => {
        layer.forEach((element, index) => {
          if (element.id === id) {
            layer[index] = { ...element, ...newAttrs } as BoardElement;
          }
        });
      });
      return updatedLayers;
    });
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

        {layers?.map((layer, index) => (
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
      <div className="invisible absolute bottom-4 right-16 z-50 sm:visible">
        <Button
          onPress={resetStage}
          isIconOnly
          color="secondary"
          variant="light"
          size="md"
          className="font-semibold"
        >
          <BoxSelectIcon />
        </Button>
      </div>
    </>
  );
}

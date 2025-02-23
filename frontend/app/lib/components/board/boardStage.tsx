'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Stage } from 'react-konva';
import GridLayer from '@/app/lib/components/board/gridLayer';
import { Button } from '@heroui/button';
import { BoxSelectIcon } from 'lucide-react';
import { BoardElement } from '@/app/lib/types/definitions';
import BoardLayer from '@/app/lib/components/board/boardLayer';

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

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;

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

const useBoardNavigation = (stageRef, scale) => {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const stage: any = stageRef.current;
    if (stage) {
      // handling mouse navigation
      const handleMouseDown = (e) => {
        if (e.evt.button === 2) {
          setIsDragging(true);
        }
      };
      const handleMouseMove = (e) => {
        if (isDragging) {
          let newX = stage.x() + e.evt.movementX;
          let newY = stage.y() + e.evt.movementY;

          const fit = fitCoordinates(
            newX,
            newY,
            window.innerWidth,
            window.innerHeight,
            scale,
          );

          stage.x(fit.x);
          stage.y(fit.y);
          stage.batchDraw();
        }
      };
      const handleMouseUp = () => {
        setIsDragging(false);
      };
      stage.on('mousedown', handleMouseDown);
      stage.on('mousemove', handleMouseMove);
      stage.on('mouseup', handleMouseUp);

      // handling wheel navigation
      const handleWheel = (e) => {
        e.evt.preventDefault();
        if (Math.abs(e.evt.deltaY as number) < 100) {
          const newX = stage.x() - e.evt.deltaX;
          const newY = stage.y() - e.evt.deltaY;

          const fit = fitCoordinates(
            newX,
            newY,
            window.innerWidth,
            window.innerHeight,
            scale,
          );

          stage.x(fit.x);
          stage.y(fit.y);
          stage.batchDraw();
        }
      };
      stage.on('wheel', handleWheel);

      // handling navigation with touch
      const handleTouchStart = (e) => {
        if (e.evt.touches.length === 2) {
          setIsDragging(true);
        }
      };
      const handleTouchMove = (e) => {
        if (isDragging && e.evt.touches.length === 2) {
          const touch1 = e.evt.touches[0];
          const touch2 = e.evt.touches[1];
          const movementX = (touch1.movementX + touch2.movementX) / 2;
          const movementY = (touch1.movementY + touch2.movementY) / 2;

          const newX = stage.x() + movementX;
          const newY = stage.y() + movementY;

          const fit = fitCoordinates(
            newX,
            newY,
            window.innerWidth,
            window.innerHeight,
            scale,
          );

          stage.x(fit.x);
          stage.y(fit.y);
          stage.batchDraw();
        }
      };
      const handleTouchEnd = () => {
        setIsDragging(false);
      };
      stage.on('touchstart', handleTouchStart);
      stage.on('touchmove', handleTouchMove);
      stage.on('touchend', handleTouchEnd);

      stage.container().addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });

      return () => {
        stage.off('mousedown', handleMouseDown);
        stage.off('mousemove', handleMouseMove);
        stage.off('mouseup', handleMouseUp);

        stage.off('wheel', handleWheel);

        stage.off('touchstart', handleTouchStart);
        stage.off('touchmove', handleTouchMove);
        stage.off('touchend', handleTouchEnd);
        stage
          .container()
          .removeEventListener('contextmenu', (e) => e.preventDefault());
      };
    }
  }, [isDragging, scale]);
};

const useBoardZoom = (stageRef, scale, setScale) => {
  useEffect(() => {
    const stage = stageRef.current;
    if (stage) {
      const handleWheel = (e) => {
        e.evt.preventDefault();

        if (Math.floor(e.evt.deltaY as number) !== (e.evt.deltaY as number)) {
          const scaleBy = 1.04;
          const oldScale = stage.scaleX();
          const pointer = stage.getPointerPosition();
          const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
          };

          const newScale =
            e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
          if (!(MIN_SCALE >= newScale || MAX_SCALE <= newScale)) {
            setScale(newScale);

            stage.scale({ x: newScale, y: newScale });
            const newPos = {
              x: pointer.x - mousePointTo.x * newScale,
              y: pointer.y - mousePointTo.y * newScale,
            };
            stage.position(newPos);
            stage.batchDraw();
          }
        }
      };

      stage.on('wheel', handleWheel);

      return () => {
        stage.off('wheel', handleWheel);
      };
    }
  }, [scale, setScale]);
};

export default function BoardStage() {
  const stageRef: any = useRef(null);
  const [layers, setLayers] = useState(testBoardLayers as BoardElement[][]);
  const [scale, setScale] = useState(1);

  useBoardNavigation(stageRef, scale);
  useBoardZoom(stageRef, scale, setScale);

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

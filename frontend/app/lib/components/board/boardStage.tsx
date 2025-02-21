'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Circle, Layer, Rect, Stage } from 'react-konva';
import GridLayer from '@/app/lib/components/board/gridLayer';

const GRID_SIZE = 24;
const MAX_X = 1000;
const MAX_Y = 1000;
const MIN_X = -2000;
const MIN_Y = -2000;

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;

const fitCoordinates = (
  x: number,
  y: number,
  screenWidth: number,
  screenHeight: number,
  scale: number,
) => {
  let newX = x;
  let newY = y;

  if (newX >= MAX_X * scale) {
    newX = MAX_X * scale - 1;
  } else if (newX - screenWidth <= MIN_X * scale) {
    newX = MIN_X * scale + screenWidth + 1;
  }

  if (newY >= MAX_Y * scale) {
    newY = MAX_Y * scale - 1;
  } else if (newY - screenHeight <= MIN_Y * scale) {
    newY = MIN_Y * scale + screenHeight + 1;
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
          const scaleBy = 1.03;
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
  const [scale, setScale] = useState(1);

  useBoardNavigation(stageRef, scale);
  useBoardZoom(stageRef, scale, setScale);

  return (
    <Stage
      width={window?.innerWidth}
      height={window?.innerHeight}
      ref={stageRef}
      onDragMove={null}
      onDragEnd={null}
    >
      <GridLayer stageRef={stageRef} scale={scale} gridSize={GRID_SIZE} />
      <Layer>
        <Rect x={50} y={50} width={100} height={100} fill="red" draggable />
        <Circle x={200} y={200} radius={50} fill="blue" draggable />
      </Layer>
    </Stage>
  );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Circle, Layer, Line, Rect, Stage } from 'react-konva';

const useBoardNavigation = (stageRef) => {
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
          stage.x(stage.x() + e.evt.movementX);
          stage.y(stage.y() + e.evt.movementY);
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
          stage.x(stage.x() - e.evt.deltaX);
          stage.y(stage.y() - e.evt.deltaY);
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
          stage.x(stage.x() + movementX);
          stage.y(stage.y() + movementY);
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
  }, [isDragging]);
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
          setScale(newScale);

          stage.scale({ x: newScale, y: newScale });
          const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
          };
          stage.position(newPos);
          stage.batchDraw();
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

  useBoardNavigation(stageRef);
  useBoardZoom(stageRef, scale, setScale);

  return (
    <Stage
      width={window?.innerWidth}
      height={window?.innerHeight}
      ref={stageRef}
    >
      <Layer>
        {Array.from({ length: 50 }, (_, i) => (
          <Line
            key={i}
            points={[i * 20, 0, i * 20, window?.innerHeight]}
            stroke="#ddd"
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: 50 }, (_, i) => (
          <Line
            key={i}
            points={[0, i * 20, window.innerWidth, i * 20]}
            stroke="#ddd"
            strokeWidth={1}
          />
        ))}
      </Layer>
      <Layer>
        {/* Add interactive elements here */}
        <Rect x={50} y={50} width={100} height={100} fill="red" draggable />
        <Circle x={200} y={200} radius={50} fill="blue" draggable />
      </Layer>
    </Stage>
  );
}

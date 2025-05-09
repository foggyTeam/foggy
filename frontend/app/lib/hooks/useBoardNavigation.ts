import { useEffect, useState } from 'react';
import { STAGE_SIZE } from '@/app/lib/components/board/boardStage';

const MAX_X = 1000;
const MAX_Y = 1000;
const MIN_X = -2000;
const MIN_Y = -2000;

const fitBoardCoordinates = (
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

export const fitElementCoordinates = (
  x: number,
  y: number,
  elementWidth: number = 200,
  elementHeight: number = 200,
  board: { x: number; y: number },
  scale: number,
) => {
  let newX = x;
  let newY = y;

  const boardX = x - board.x + MAX_X * scale;
  const boardY = y - board.y + MAX_Y * scale;

  if (boardX < 0) newX = board.x - MAX_X * scale;
  else if (boardX > (STAGE_SIZE - elementWidth) * scale)
    newX = (STAGE_SIZE - elementWidth) * scale + board.x - MAX_X * scale;

  if (boardY < 0) newY = board.y - MAX_Y * scale;
  else if (boardY > (STAGE_SIZE - elementHeight) * scale)
    newY = (STAGE_SIZE - elementHeight) * scale + board.y - MAX_Y * scale;

  return { x: newX, y: newY };
};

export default function UseBoardNavigation(stageRef: any, scale: number) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const stage: any = stageRef.current;
    if (stage) {
      // handling mouse navigation
      const handleMouseDown = (e: any) => {
        if (e.evt.button === 2) {
          setIsDragging(true);
        }
      };
      const handleMouseMove = (e: any) => {
        if (isDragging) {
          const newX = stage.x() + e.evt.movementX;
          const newY = stage.y() + e.evt.movementY;

          const fit = fitBoardCoordinates(
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
      const handleWheel = (e: any) => {
        e.evt.preventDefault();
        if (Math.abs(e.evt.deltaY as number) < 100) {
          const newX = stage.x() - e.evt.deltaX;
          const newY = stage.y() - e.evt.deltaY;

          const fit = fitBoardCoordinates(
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
      const handleTouchStart = (e: any) => {
        if (e.evt.touches.length === 2) {
          setIsDragging(true);
        }
      };
      const handleTouchMove = (e: any) => {
        if (isDragging && e.evt.touches.length === 2) {
          const touch1 = e.evt.touches[0];
          const touch2 = e.evt.touches[1];
          const movementX = (touch1.movementX + touch2.movementX) / 2;
          const movementY = (touch1.movementY + touch2.movementY) / 2;

          const newX = stage.x() + movementX;
          const newY = stage.y() + movementY;

          const fit = fitBoardCoordinates(
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

      stage.container().addEventListener('contextmenu', (e: any) => {
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
          .removeEventListener('contextmenu', (e: any) => e.preventDefault());
      };
    }
  }, [isDragging, scale]);
}

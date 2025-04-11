import { useEffect, useState } from 'react';
import { fitCoordinates } from '@/app/lib/components/board/boardStage';

export default function UseBoardNavigation(stageRef, scale) {
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
          const newX = stage.x() + e.evt.movementX;
          const newY = stage.y() + e.evt.movementY;

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
}

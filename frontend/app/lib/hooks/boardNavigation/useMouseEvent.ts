'use client';

import { useEffect, useRef } from 'react';

export default function UseMouseEvent(
  stageRef: any,
  isStageValid: boolean,
  dragBy: (dx: number, dy: number) => void,
) {
  const isDragging = useRef(false);

  useEffect(() => {
    const stage: any = stageRef.current;
    if (!stage) return;

    // MOUSE NAVIGATION
    const handleMouseDown = (e: any) => {
      if (e.evt.button === 2) isDragging.current = true;
    };
    const handleMouseMove = (e: any) => {
      if (!isDragging.current) return;
      dragBy(e.evt.movementX, e.evt.movementY);
    };
    const handleMouseUp = () => {
      isDragging.current = false;
    };

    stage.on('mousedown', handleMouseDown);
    stage.on('mousemove', handleMouseMove);
    stage.on('mouseup', handleMouseUp);

    const preventContextMenu = (e: any) => e.preventDefault();
    stage.container().addEventListener('contextmenu', preventContextMenu);

    return () => {
      stage.off('mousedown', handleMouseDown);
      stage.off('mousemove', handleMouseMove);
      stage.off('mouseup', handleMouseUp);

      stage.container().removeEventListener('contextmenu', preventContextMenu);
    };
  }, [stageRef, isStageValid, dragBy]);
}

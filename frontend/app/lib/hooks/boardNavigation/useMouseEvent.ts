'use client';

import { useEffect, useRef } from 'react';
import { useBoardContext } from '@/app/lib/components/board/boardContext';

export default function UseMouseEvent(
  stageRef: any,
  scale: number,
  viewPort: { width: number; height: number },
) {
  const { updateGridRef } = useBoardContext();
  const isDragging = useRef(false);

  const requestGridUpdate = () => updateGridRef.current?.();

  useEffect(() => {
    const stage: any = stageRef.current;
    if (!stage) return;

    const safeSetPosition = (x: number, y: number) => {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      stage.position({ x, y });
      stage.batchDraw();
      requestGridUpdate();
    };

    // MOUSE NAVIGATION
    const handleMouseDown = (e: any) => {
      if (e.evt.button === 2) isDragging.current = true;
    };
    const handleMouseMove = (e: any) => {
      if (!isDragging.current) return;
      safeSetPosition(stage.x() + e.evt.movementX, stage.y() + e.evt.movementY);
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
  }, [stageRef, scale, viewPort.width, viewPort.height, updateGridRef]);
}

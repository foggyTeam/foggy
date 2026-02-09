'use client';

import { useBoardContext } from '@/app/lib/components/board/boardContext';
import { useEffect, useRef } from 'react';

function getTouchesCenter(t1: Touch, t2: Touch) {
  return {
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  };
}

export default function UseTouchEvent(
  stageRef: any,
  scale: number,
  viewPort: { width: number; height: number },
) {
  const { updateGridRef } = useBoardContext();
  const isDragging = useRef(false);
  const prevTouchCenter = useRef<{ x: number; y: number } | null>(null);

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

    // TOUCH NAVIGATION
    const handleTouchStart = (e: any) => {
      if (e.evt.touches.length === 2) {
        isDragging.current = true;
        const [t1, t2] = e.evt.touches;
        prevTouchCenter.current = getTouchesCenter(t1, t2);
      }
    };
    const handleTouchMove = (e: any) => {
      if (!(isDragging.current && e.evt.touches.length === 2)) return;

      const [t1, t2] = e.evt.touches;
      const center = getTouchesCenter(t1, t2);

      const prev = prevTouchCenter.current;
      if (!prev) {
        prevTouchCenter.current = center;
        return;
      }

      const dx = center.x - prev.x;
      const dy = center.y - prev.y;

      prevTouchCenter.current = center;

      safeSetPosition(stage.x() + dx, stage.y() + dy);
    };
    const stopTouchDragging = () => {
      isDragging.current = false;
      prevTouchCenter.current = null;
    };

    stage.on('touchstart', handleTouchStart);
    stage.on('touchmove', handleTouchMove);
    stage.on('touchend', stopTouchDragging);
    stage.on('touchcancel', stopTouchDragging);

    return () => {
      stage.off('touchstart', handleTouchStart);
      stage.off('touchmove', handleTouchMove);
      stage.off('touchend', stopTouchDragging);
      stage.off('touchcancel', stopTouchDragging);
    };
  }, [stageRef, scale, viewPort.width, viewPort.height, updateGridRef]);
}

'use client';

import { useEffect, useRef } from 'react';

function getTouchesCenter(t1: Touch, t2: Touch) {
  return {
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  };
}

function getTouchesDistance(t1: Touch, t2: Touch) {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

export default function UseTouchEvent(
  stageRef: any,
  isStageValid: boolean,
  dragBy: (dx: number, dy: number) => void,
  zoomTo: (scale: number, anchor: { x: number; y: number }) => void,
) {
  const isPinching = useRef(false);
  const prevCenter = useRef<{ x: number; y: number } | null>(null);
  const prevDistance = useRef<number | null>(null);

  useEffect(() => {
    const stage: any = stageRef.current;
    if (!stage) return;

    // TOUCH NAVIGATION
    const handleTouchStart = (e: any) => {
      if (e.evt.touches.length === 2) {
        const [t1, t2] = e.evt.touches;

        isPinching.current = true;
        prevCenter.current = getTouchesCenter(t1, t2);
        prevDistance.current = getTouchesDistance(t1, t2);
      }
    };

    const handleTouchMove = (e: any) => {
      if (!isPinching.current || e.evt.touches.length !== 2) return;

      const [t1, t2] = e.evt.touches;

      const center = getTouchesCenter(t1, t2);
      const distance = getTouchesDistance(t1, t2);

      const prevC = prevCenter.current;
      const prevD = prevDistance.current;

      if (!prevC || !prevD) {
        prevCenter.current = center;
        prevDistance.current = distance;
        return;
      }

      // PAN
      dragBy(center.x - prevC.x, center.y - prevC.y);

      // ZOOM
      const scaleBy = distance / prevD;
      if (
        Number.isFinite(scaleBy) &&
        scaleBy !== 1 &&
        Math.abs(scaleBy - 1) > 0.01
      ) {
        const nextScale = stage.scaleX() * scaleBy;
        zoomTo(nextScale, center);
      }

      prevCenter.current = center;
      prevDistance.current = distance;
    };

    const stopPinch = () => {
      isPinching.current = false;
      prevCenter.current = null;
      prevDistance.current = null;
    };

    stage.on('touchstart', handleTouchStart);
    stage.on('touchmove', handleTouchMove);
    stage.on('touchend', stopPinch);
    stage.on('touchcancel', stopPinch);

    return () => {
      stage.off('touchstart', handleTouchStart);
      stage.off('touchmove', handleTouchMove);
      stage.off('touchend', stopPinch);
      stage.off('touchcancel', stopPinch);
    };
  }, [stageRef, isStageValid, dragBy, zoomTo]);
}

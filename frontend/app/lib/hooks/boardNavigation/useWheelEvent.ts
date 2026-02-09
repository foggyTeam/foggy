'use client';

import { useEffect } from 'react';

const WHEEL_DELTA = 50;

export default function UseWheelEvent(
  stageRef: any,

  isStageValid: boolean,
  dragBy: (dx: number, dy: number) => void,
  zoomTo: (scale: number, anchor: { x: number; y: number }) => void,
) {
  useEffect(() => {
    const stage: any = stageRef.current;
    if (!stage) return;

    const handleWheel = (e: any) => {
      e.evt.preventDefault();

      const isPinchZoom = e.evt.ctrlKey;
      const isMouseWheel =
        !isPinchZoom &&
        e.evt.deltaX === 0 &&
        Math.abs(e.evt.deltaY) > WHEEL_DELTA;

      // WHEEL
      if (isPinchZoom || isMouseWheel) {
        const scaleBy = 1.04;
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        if (!pointer) return;

        const newScale =
          e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

        zoomTo(newScale, { x: pointer.x, y: pointer.y });

        return;
      }

      // TOUCHPAD
      if (Math.abs(e.evt.deltaY as number) < 100) {
        dragBy(-e.evt.deltaX, -e.evt.deltaY);
      }
    };

    stage.on('wheel', handleWheel);

    return () => {
      stage.off('wheel', handleWheel);
    };
  }, [stageRef, isStageValid]);
}

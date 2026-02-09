import { useEffect } from 'react';
import { useBoardContext } from '@/app/lib/components/board/boardContext';

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const WHEEL_DELTA = 50;

export default function UseBoardZoom(
  stageRef: any,
  setScale: any,
  viewPort: { width: number; height: number },
) {
  const { updateGridRef } = useBoardContext();
  useEffect(() => {
    const stage = stageRef.current;
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

          if (updateGridRef.current) {
            updateGridRef.current();
          }
        }
        return;
      }

      // TOUCHPAD
      if (Math.abs(e.evt.deltaY as number) < 100) {
        const newX = stage.x() - e.evt.deltaX;
        const newY = stage.y() - e.evt.deltaY;

        stage.position({ x: newX, y: newY });

        stage.batchDraw();
        if (updateGridRef.current) updateGridRef.current();
      }
    };

    stage.on('wheel', handleWheel);

    return () => {
      stage.off('wheel', handleWheel);
    };
  }, [stageRef, viewPort.width, viewPort.height]);
}

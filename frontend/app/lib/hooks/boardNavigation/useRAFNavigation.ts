'use client';

import { useCallback, useEffect, useRef } from 'react';

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;

type Point = {
  x: number;
  y: number;
};

// Redraws are driven by request animation frame
export default function UseRAFNavigation(
  stageRef: any,
  setScale: any,
  callback?: () => void,
) {
  const rafId = useRef<number | null>(null);

  const pendingOffset = useRef<Point | null>(null);
  const pendingZoom = useRef<{ scale: number; anchor: Point } | null>(null);

  const schedule = useCallback(() => {
    if (rafId.current != null) return;

    rafId.current = window.requestAnimationFrame(() => {
      rafId.current = null;

      const stage: any = stageRef.current;
      if (!stage) {
        pendingOffset.current = null;
        pendingZoom.current = null;
        return;
      }

      const offset = pendingOffset.current;
      const zoom = pendingZoom.current;

      // New events can queue
      pendingOffset.current = null;
      pendingZoom.current = null;

      let nextX;
      let nextY;

      // OFFSET
      if (offset) {
        nextX = stage.x() + offset.x;
        nextY = stage.y() + offset.y;

        if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) return;

        stage.position({ x: nextX, y: nextY });
      }

      // ZOOM
      if (zoom) {
        const { scale: nextScale, anchor } = zoom;

        const oldScale = stage.scaleX();
        if (!Number.isFinite(oldScale) || oldScale === 0) return;

        const worldPoint = {
          x: (anchor.x - stage.x()) / oldScale,
          y: (anchor.y - stage.y()) / oldScale,
        };

        if (!Number.isFinite(worldPoint.x) || !Number.isFinite(worldPoint.y))
          return;

        stage.scale({ x: nextScale, y: nextScale });

        nextX = anchor.x - worldPoint.x * nextScale;
        nextY = anchor.y - worldPoint.y * nextScale;
      }

      if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) return;

      stage.position({ x: nextX, y: nextY });
      stage.batchDraw();
      callback?.();
    });
  }, [stageRef, callback]);

  const dragBy = useCallback(
    (dx: number, dy: number) => {
      if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;
      if (!pendingOffset.current) pendingOffset.current = { x: dx, y: dy };
      else {
        pendingOffset.current = {
          x: pendingOffset.current?.x + dx,
          y: pendingOffset.current?.y + dy,
        };
      }
      schedule();
    },
    [schedule],
  );

  const zoomTo = useCallback(
    (scale: number, anchor: Point) => {
      if (
        !Number.isFinite(scale) ||
        !Number.isFinite(anchor.x) ||
        !Number.isFinite(anchor.y) ||
        MIN_SCALE >= scale ||
        MAX_SCALE <= scale
      )
        return;
      setScale(scale);
      pendingZoom.current = { scale, anchor };
      schedule();
    },
    [schedule],
  );

  useEffect(() => {
    return () => {
      if (typeof rafId.current === 'number')
        cancelAnimationFrame(rafId.current);
    };
  }, []);

  return { dragBy, zoomTo };
}

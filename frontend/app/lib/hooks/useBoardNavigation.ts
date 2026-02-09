import { useEffect, useRef } from 'react';
import { useBoardContext } from '@/app/lib/components/board/boardContext';

const MAX_X = 1000;
const MAX_Y = 1000;
const MIN_X = -2000;
const MIN_Y = -2000;

const CLAMP_TO_BOUNDS = false;

type ViewportSize = { width: number; height: number };

const fitBoardCoordinates = (
  x: number,
  y: number,
  viewport: ViewportSize,
  scale: number,
) => {
  if (!CLAMP_TO_BOUNDS) return { x, y };

  let newX = x;
  let newY = y;

  const maxStageX = -MIN_X * scale;
  if (newX > maxStageX) newX = maxStageX;

  const minStageX = viewport.width - MAX_X * scale;
  if (newX < minStageX) newX = minStageX;

  const maxStageY = -MIN_Y * scale;
  if (newY > maxStageY) newY = maxStageY;

  const minStageY = viewport.height - MAX_Y * scale;
  if (newY < minStageY) newY = minStageY;

  return { x: newX, y: newY };
};

export const fitElementCoordinates = (
  x: number,
  y: number,
  elementWidth: number = 200,
  elementHeight: number = 200,
  board: { x: number; y: number },
  scale: number,
  // real coordinates for line
  line: { x: number; y: number } = { x: 0, y: 0 },
) => {
  if (!CLAMP_TO_BOUNDS) return { x, y };

  let newX = x;
  let newY = y;

  const worldX = x + line.x - board.x / scale;
  const worldY = y + line.y - board.y / scale;

  if (worldX < MIN_X) newX = MIN_X - line.x + board.x / scale;
  else if (worldX > MAX_X - elementWidth)
    newX = MAX_X - elementWidth - line.x + board.x / scale;

  if (worldY < MIN_Y) newY = MIN_Y - line.y + board.y / scale;
  else if (worldY > MAX_Y - elementHeight)
    newY = MAX_Y - elementHeight - line.y + board.y / scale;

  return { x: newX, y: newY };
};

export default function UseBoardNavigation(
  stageRef: any,
  scale: number,
  viewPort: ViewportSize,
) {
  const { updateGridRef } = useBoardContext();
  const isDragging = useRef(false);

  useEffect(() => {
    const stage: any = stageRef.current;
    if (!stage) return;

    const requestGridUpdate = () => {
      if (updateGridRef.current) updateGridRef.current();
    };

    // handling mouse navigation
    const handleMouseDown = (e: any) => {
      if (e.evt.button === 2) {
        isDragging.current = true;
      }
    };
    const handleMouseMove = (e: any) => {
      if (isDragging.current) {
        const newX = stage.x() + e.evt.movementX;
        const newY = stage.y() + e.evt.movementY;

        const fit = fitBoardCoordinates(newX, newY, viewPort, scale);

        stage.position(fit);
        stage.batchDraw();
        requestGridUpdate();
      }
    };
    const handleMouseUp = () => {
      isDragging.current = false;
    };

    // handling navigation with touch
    const handleTouchStart = (e: any) => {
      if (e.evt.touches.length === 2) {
        isDragging.current = true;
      }
    };
    const handleTouchMove = (e: any) => {
      if (!(isDragging.current && e.evt.touches.length === 2)) return;

      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];
      const movementX = (touch1.movementX + touch2.movementX) / 2;
      const movementY = (touch1.movementY + touch2.movementY) / 2;

      const newX = stage.x() + movementX;
      const newY = stage.y() + movementY;

      const fit = fitBoardCoordinates(newX, newY, viewPort, scale);

      stage.position(fit);
      stage.batchDraw();
      requestGridUpdate();
    };
    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    stage.on('mousedown', handleMouseDown);
    stage.on('mousemove', handleMouseMove);
    stage.on('mouseup', handleMouseUp);
    stage.on('touchstart', handleTouchStart);
    stage.on('touchmove', handleTouchMove);
    stage.on('touchend', handleTouchEnd);

    const preventContextMenu = (e: any) => e.preventDefault();
    stage.container().addEventListener('contextmenu', preventContextMenu);

    return () => {
      stage.off('mousedown', handleMouseDown);
      stage.off('mousemove', handleMouseMove);
      stage.off('mouseup', handleMouseUp);

      stage.off('touchstart', handleTouchStart);
      stage.off('touchmove', handleTouchMove);
      stage.off('touchend', handleTouchEnd);
      stage.container().removeEventListener('contextmenu', preventContextMenu);
    };
  }, [stageRef, scale, viewPort.width, viewPort.height, updateGridRef]);
}

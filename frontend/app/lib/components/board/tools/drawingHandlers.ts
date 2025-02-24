import { BoardElement } from '@/app/lib/types/definitions';
import { primary } from '@/tailwind.config';

interface DrawingHandlersProps {
  stageRef: any;
  activeTool: string;
  setActiveTool: (tool: string) => void;
  addElement: (element: BoardElement) => void;
  updateElement: (id: string, newAttrs: Partial<BoardElement>) => void;
  setDrawing: (drawing: boolean) => void;
  setNewElement: (element: BoardElement | null) => void;
  newElement: BoardElement | null;
}

const DEFAULT_FILL = primary['100'];
const DEFAULT_STROKE = primary['300'];

const getRelativePointerPosition = (stage) => {
  const transform = stage.getAbsoluteTransform().copy();
  transform.invert();
  const pos = stage.getPointerPosition();
  return transform.point(pos);
};

export const handleMouseDown =
  ({
    stageRef,
    activeTool,
    addElement,
    setDrawing,
    setNewElement,
  }: DrawingHandlersProps) =>
  (e: any) => {
    if (activeTool && stageRef.current) {
      const stage = stageRef.current.getStage();
      const { x, y } = getRelativePointerPosition(stage);

      const element = {
        id: `${activeTool}_${Date.now()}`,
        type: activeTool,
        draggable: true,
        dragDistance: 4,
        x,
        y,
        rotation: 0,
        fill: DEFAULT_FILL,
        stroke: DEFAULT_STROKE,
        strokeWidth: 2,
        cornerRadius: 4,
        width: 16,
        height: 16,
      } as BoardElement;

      setNewElement(element);
      addElement(element);
      setDrawing(true);
    }
  };

export const handleMouseMove =
  ({ stageRef, drawing, newElement, updateElement }: DrawingHandlersProps) =>
  (e: any) => {
    if (drawing && newElement && stageRef.current) {
      const stage = stageRef.current.getStage();
      const { x, y } = getRelativePointerPosition(stage);
      const width = x - newElement.x;
      const height = y - newElement.y;

      const updatedElement = {
        ...newElement,
        x: width < 0 ? x : newElement.x,
        y: height < 0 ? y : newElement.y,
        width: Math.abs(width),
        height: Math.abs(height),
      } as BoardElement;

      updateElement(newElement.id, updatedElement);
    }
  };

export const handleMouseUp =
  ({
    drawing,
    setDrawing,
    setNewElement,
    setActiveTool,
  }: DrawingHandlersProps) =>
  (e: any) => {
    if (drawing) {
      setDrawing(false);
      setNewElement(null);
      setActiveTool('');
    }
  };

import { BoardElement, TextElement } from '@/app/lib/types/definitions';
import { primary } from '@/tailwind.config';
import { HtmlToSvg } from '@/app/lib/utils/htmlToSvg';

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

export interface TextEdit {
  id: string;
  isEditing: boolean;
  x: number;
  y: number;
  content: string;
  textWidth: number;
  textHeight: number;
}

const DEFAULT_FILL = primary['200'];
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

export const handlePlaceText =
  ({
    stageRef,
    activeTool,
    setActiveTool,
    addElement,
    isEditing,
    setIsEditing,
    content,
    setContent,
    clickPosition,
    setClickPosition,
    textHeight,
    setTextHeight,
  }) =>
  async (e: any) => {
    if (isEditing) {
      const { x, y } = clickPosition;
      const defaultTextWidth = 432;

      const svg = HtmlToSvg(content, defaultTextWidth, textHeight);

      const element = {
        id: `${activeTool}_${Date.now()}`,
        type: 'text',
        draggable: true,
        dragDistance: 4,
        x,
        y,
        rotation: 0,
        svg: svg,
        content: content,
        width: defaultTextWidth,
        height: textHeight,
        cornerRadius: 0,
      } as BoardElement;

      addElement(element);

      setIsEditing(false);
      setContent('');
      setTextHeight(0);
      setClickPosition({ x: undefined, y: undefined });
    } else if (activeTool && stageRef.current) {
      const stage = stageRef.current.getStage();
      const { x, y } = getRelativePointerPosition(stage);

      setIsEditing(true);
      setClickPosition({ x: x, y: y });
      setActiveTool('');
    }
  };

export const handleEditText = ({
  stageRef,
  target,
  updateElement,
  content,
  setContent,
  textEditing,
  setTextEditing,
}) => {
  if (target.parent) {
    const stage = stageRef.current.getStage();
    const { x, y } = getRelativePointerPosition(stage);
    const element: TextElement = target.attrs;
    setContent(element.content);

    setTextEditing({
      id: element.id,
      isEditing: true,
      x: x - 33.4,
      y: y - 23.6,
      content: element.content,
      textHeight: element.height,
      textWidth: element.width,
    } as TextEdit);

    hideTextElement(element.id, element.width, element.height, updateElement);
  } else {
    const svg = HtmlToSvg(
      content,
      textEditing.textWidth,
      textEditing.textHeight,
    );

    updateElement(textEditing.id, {
      svg: svg,
      content: content,
      height: textEditing.textHeight,
    });

    setTextEditing(null);
    setContent('');
  }
};

const hideTextElement = (
  id: string,
  width: number,
  height: number,
  updateElement,
) => {
  const svg = HtmlToSvg('', width, height);

  updateElement(id, {
    svg: svg,
    content: '',
    height: height,
  });
};

const isTransparent = (color: string) => {
  if (!color) return true;
  return (
    color.length === 9 && color[7] === '0' && '0123456789abc'.includes(color[8])
  );
};
export const isElementVisible = (
  elementType: string,
  fillColor: string,
  strokeColor: string,
  strokeWidth: number,
) => {
  if (strokeWidth == 0 && isTransparent(fillColor)) return false;
  return !(
    (!strokeColor || isTransparent(strokeColor)) &&
    isTransparent(fillColor)
  );
};

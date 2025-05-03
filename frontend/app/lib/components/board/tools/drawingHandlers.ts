import { BoardElement, TextElement } from '@/app/lib/types/definitions';
import { primary } from '@/tailwind.config';
import { HtmlToSvg } from '@/app/lib/utils/htmlToSvg';
import userStore from '@/app/stores/userStore';

interface DrawingHandlersProps {
  stageRef: any;
  activeTool: string;
  setActiveTool: (tool: string) => void;
  addElement: (element: BoardElement) => void;
  updateElement: (id: string, newAttrs: Partial<BoardElement>) => void;
  drawing?: boolean;
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

const getRelativePointerPosition = (stage: any) => {
  const transform = stage.getAbsoluteTransform().copy();
  transform.invert();
  const pos = transform.point(stage.getPointerPosition());

  const stagePosition = stage.getPosition();
  return {
    stagePosition: { x: pos.x, y: pos.y },
    editorPosition: { x: pos.x + stagePosition.x, y: pos.y + stagePosition.y },
  };
};

const getRelativeElementPosition = (stage: any, element: any) => {
  const stagePosition = stage.getPosition();
  const x = element.x + stagePosition.x;
  const y = element.y + stagePosition.y;
  return { x, y };
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
      const { x, y } = getRelativePointerPosition(stage).stagePosition;

      const element = {
        id: `${activeTool}${Date.now().toString()}${userStore.user?.id.toString().substring(19, 23)}`,
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
      const { x, y } = getRelativePointerPosition(stage).stagePosition;
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
    resetStage,
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
  }: any) =>
  async (e: any) => {
    if (isEditing) {
      const { x, y } = clickPosition.stagePosition;
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
      resetStage(true);

      const stage = stageRef.current.getStage();
      const position = getRelativePointerPosition(stage);

      setIsEditing(true);
      setClickPosition(position);
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
}: any) => {
  if (target.parent) {
    const stage = stageRef.current.getStage();
    const element: TextElement = target.attrs;
    setContent(element.content);

    const { x, y } = getRelativeElementPosition(stage, element);

    setTextEditing({
      id: element.id,
      isEditing: true,
      x: x,
      y: y,
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
  updateElement: any,
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

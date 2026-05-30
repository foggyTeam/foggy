import {
  LineElement,
  SBoardElement,
  TextElement,
} from '@/app/lib/types/definitions';
import { primary } from '@/tailwind.config';
import { HtmlToSvg } from '@/app/lib/utils/htmlToSvg';
import userStore from '@/app/stores/userStore';
import Konva from 'konva';
import { RefObject } from 'react';
import { HandleBoardImageElementUpload } from '@/app/lib/utils/handleImageUpload';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';

interface DrawingHandlersProps {
  stageRef: any;
  activeTool: string;
  setActiveTool: (tool: string) => void;
  addElement: (element: SBoardElement) => void;
  updateElement: (id: string, newAttrs: Partial<SBoardElement>) => void;
  drawing?: boolean;
  setDrawing: (drawing: boolean) => void;
  setNewElement: (element: SBoardElement | null) => void;
  newElement: SBoardElement | null;
}

interface FreeDrawingHandlersProps {
  stageRef: any;
  activeTool: 'pencil' | 'eraser' | 'arrow';
  setActiveTool: (tool: string) => void;
  addElement: (element: LineElement) => void;
  updateElement: (id: string, newAttrs: Partial<LineElement>) => void;
  drawing?: boolean;
  setDrawing: (drawing: boolean) => void;
  setNewElement: (element: LineElement | null) => void;
  newElement: LineElement | null;
  pencilParams: PencilParams;
}

interface ImageHandlersProps extends DrawingHandlersProps {
  inputClickEventRef: RefObject<any | null>;
  setIsLoading: (isLoading: boolean) => void;
}

export interface PencilParams {
  color: string;
  width: number;
  tension: number;
  lineJoin: 'miter' | 'round' | 'bevel';
  lineCap: 'butt' | 'round' | 'square';
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

const DEFAULT_FILL = primary.light['200'];
const DEFAULT_STROKE = primary.light['300'];
const DEFAULT_STROKE_WIDTH = 2;
const DEFAULT_STAR_POINTS = 5;
const ERASER_RADIUS = 4;

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

const getRelativeElementPosition = (
  stage: Konva.Stage,
  element: SBoardElement,
) => {
  const stageX = stage.x();
  const stageY = stage.y();
  const scale = stage.scaleX();

  const x = (element.x - stageX) / scale;
  const y = (element.y - stageY) / scale;

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
    if (e.evt.buttons === 2) return;
    if (activeTool && stageRef.current) {
      const stage = stageRef.current.getStage();
      const { x, y } = getRelativePointerPosition(stage).stagePosition;

      const element = {
        id: getElementId(activeTool),
        type: activeTool,
        draggable: true,
        dragDistance: 4,
        x,
        y,
        rotation: 0,
        fill: DEFAULT_FILL,
        stroke: DEFAULT_STROKE,
        strokeWidth: DEFAULT_STROKE_WIDTH,
        cornerRadius: 4,
        width: 16,
        height: 16,
      } as SBoardElement;

      if (activeTool === 'image')
        Object.assign(element, {
          url: null,
        });

      if (activeTool === 'star')
        Object.assign(element, {
          numPoints: DEFAULT_STAR_POINTS,
          innerRadius: 3.2,
          outerRadius: 8,
        });
      if (activeTool === 'triangle')
        Object.assign(element, { points: [8, 0, 16, 16, 0, 16] });

      setNewElement(element);
      addElement(element);
      setDrawing(true);
    }
  };

export const handleMouseMove =
  ({ stageRef, drawing, newElement, updateElement }: DrawingHandlersProps) =>
  () => {
    if (drawing && newElement && stageRef.current) {
      const stage = stageRef.current.getStage();
      const { x, y } = getRelativePointerPosition(stage).stagePosition;
      const width = x - newElement.x;
      const height = y - newElement.y;

      const updatedElement = {
        x: width < 0 ? x : newElement.x,
        y: height < 0 ? y : newElement.y,
        width: Math.abs(width),
        height: Math.abs(height),
      } as SBoardElement;

      if (newElement.type === 'star')
        Object.assign(updatedElement, {
          innerRadius: (Math.min(width, height) / 2) * 0.4,
          outerRadius: Math.min(width, height) / 2,
        });
      if (newElement.type === 'triangle')
        Object.assign(updatedElement, {
          points: [width / 2, 0, width, height, 0, height],
        });

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
  () => {
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
  async () => {
    if (isEditing) {
      const { x, y } = clickPosition.stagePosition;
      const defaultTextWidth = 432;

      const svg = HtmlToSvg(content, defaultTextWidth, textHeight);

      const element = {
        id: getElementId(activeTool),
        type: 'text',
        draggable: true,
        dragDistance: 4,
        x,
        y,
        rotation: 0,
        fill: '#AA99B900',
        stroke: '#AA99B900',
        strokeWidth: 0,
        svg: svg,
        content: content,
        cornerRadius: 0,
        width: defaultTextWidth,
        height: textHeight,
      } as SBoardElement;

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

export const handleStartDrawing =
  ({
    stageRef,
    activeTool,
    addElement,
    setDrawing,
    setNewElement,
    pencilParams,
  }: FreeDrawingHandlersProps) =>
  (e: any) => {
    if (e.evt.buttons === 2) return;
    if (
      (activeTool === 'pencil' || activeTool === 'arrow') &&
      stageRef.current
    ) {
      const stage = stageRef.current.getStage();
      const { x, y } = getRelativePointerPosition(stage).stagePosition;

      const element = {
        id: getElementId(activeTool),
        type: 'line',
        draggable: true,
        dragDistance: 4,
        x: 0,
        y: 0,
        width: 200,
        height: 200,
        rotation: 0,
        fill: '#AA99B900',
        stroke: pencilParams.color,
        strokeWidth: pencilParams.width,
        points: [x, y],
        lineCap: pencilParams.lineCap,
        lineJoin: pencilParams.lineJoin,
        tension: pencilParams.tension,
      } as LineElement;

      if (activeTool === 'arrow')
        Object.assign(element, {
          type: 'arrow',
          pointerAtBeginning: false,
          pointerAtEnding: true,
        });

      setNewElement(element);
      addElement(element);
      setDrawing(true);
    }
  };

export const handleDrawing =
  ({
    stageRef,
    drawing,
    newElement,
    setNewElement,
    updateElement,
  }: FreeDrawingHandlersProps) =>
  (e: any) => {
    if (e.evt.buttons === 2) return;
    if (drawing && newElement && stageRef.current) {
      const stage = stageRef.current.getStage();
      const { x, y } = getRelativePointerPosition(stage).stagePosition;

      const updatedPoints = e.evt.shiftKey
        ? newElement.points.slice(0, 2)
        : newElement.points;
      updatedPoints.push(x, y);

      setNewElement({ ...newElement, points: updatedPoints });
      updateElement(newElement.id, { points: updatedPoints });
    }
  };

export const handleEndDrawing =
  ({
    drawing,
    newElement,
    setDrawing,
    setNewElement,
    updateElement,
  }: FreeDrawingHandlersProps) =>
  (e: any) => {
    if (e.evt.buttons === 2) return;
    if (drawing && newElement) {
      const xPoints: number[] = [];
      const yPoints: number[] = [];
      newElement.points.map((point, index) =>
        index % 2 ? yPoints.push(point) : xPoints.push(point),
      );

      updateElement(newElement.id, {
        ...(newElement.points.length < 4 && {
          points: [...newElement.points, ...newElement.points],
        }),
        width: Math.max(...xPoints) - Math.min(...xPoints) + 1,
        height: Math.max(...yPoints) - Math.min(...yPoints) + 1,
      });

      setDrawing(false);
      setNewElement(null);
    }
  };

export const handleStartErasing =
  ({
    stageRef,
    activeTool,
    setDrawing,
  }: {
    stageRef: any;
    activeTool: string;
    setDrawing: (isDrawing: boolean) => void;
  }) =>
  (e: any) => {
    if (e.evt.buttons === 2) return;
    if (activeTool === 'eraser' && stageRef.current) {
      setDrawing(true);
    }
  };

export const handleErasing =
  ({
    stageRef,
    drawing,
    removeElement,
  }: {
    stageRef: any;
    drawing: boolean;
    removeElement: (id: string) => void;
  }) =>
  (e: any) => {
    if (e.evt.buttons === 2) return;
    if (drawing && stageRef.current) {
      const stage = stageRef.current.getStage();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const removed = new Set<string>();

      for (let dx = -ERASER_RADIUS; dx <= ERASER_RADIUS; dx += 2) {
        for (let dy = -ERASER_RADIUS; dy <= ERASER_RADIUS; dy += 2) {
          if (dx * dx + dy * dy > ERASER_RADIUS * ERASER_RADIUS) continue;

          const hit = stage.getIntersection({
            x: pointer.x + dx,
            y: pointer.y + dy,
          });

          const id = hit?.attrs?.id;
          if (id && !removed.has(id)) {
            removed.add(id);
            removeElement(id);
          }
        }
      }
    }
  };

export const handleEndErasing =
  ({
    drawing,
    setDrawing,
  }: {
    drawing: boolean;
    setDrawing: (isDrawing: boolean) => void;
  }) =>
  (e: any) => {
    if (e.evt.buttons === 2) return;
    if (drawing) setDrawing(false);
  };

export const handlePlaceImageUpload =
  ({
    newElement,
    inputClickEventRef,
    updateElement,
    setDrawing,
    setNewElement,
    setActiveTool,
    setIsLoading,
    drawing,
  }: ImageHandlersProps) =>
  async (e: any) => {
    if (e.evt.buttons === 2) return;
    if (!inputClickEventRef?.current) return;

    if (drawing) {
      setDrawing(false);
      setActiveTool('');

      if (!newElement) return;

      setIsLoading(true);
      const url = await getImageUrl(inputClickEventRef.current);

      if (url)
        updateElement(newElement.id, {
          url,
          strokeWidth: 0,
          fill: `${DEFAULT_FILL}00`,
        });
      setIsLoading(false);

      setNewElement(null);
    }
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
  if (elementType === 'image') return true;
  if (strokeWidth == 0 && isTransparent(fillColor)) return false;
  return !(
    (!strokeColor || isTransparent(strokeColor)) &&
    isTransparent(fillColor)
  );
};

const getElementId = (tool: string) => {
  if (!userStore.user?.id) return '';
  const userId = userStore.user.id;
  return `${tool}_${Date.now()}_${userId.slice(userId.length - 5, userId.length - 1)}`;
};

const getImageUrl = async (event: any) => {
  const url = await HandleBoardImageElementUpload(event.target.files[0]);
  if (url) return url;

  addToast({
    color: 'danger',
    severity: 'danger',
    title: settingsStore.t.toasts.globalError,
  });
  return null;
};

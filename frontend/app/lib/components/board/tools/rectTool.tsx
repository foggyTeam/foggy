import { SquareIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { useEffect, useState } from 'react';
import { primary } from '@/tailwind.config';
import {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
} from '@/app/lib/components/board/tools/drawingHandlers';
import cursorAdd from '@/app/lib/components/svg/cursorAdd';

export default function RectTool({
  activeTool,
  setActiveTool,
  stageRef,
  addElement,
  updateElement,
}) {
  const [drawing, setDrawing] = useState(false);
  const [newElement, setNewElement] = useState(null);

  useEffect(() => {
    const mouseDownHandler = handleMouseDown({
      stageRef,
      activeTool,
      addElement,
      setDrawing,
      setNewElement,
    } as any);

    const mouseMoveHandler = handleMouseMove({
      stageRef,
      drawing,
      newElement,
      updateElement,
    } as any);

    const mouseUpHandler = handleMouseUp({
      drawing,
      setDrawing,
      setNewElement,
      setActiveTool,
    } as any);

    if (activeTool === 'rect' && stageRef.current) {
      const stage = stageRef.current.getStage();
      stage.container().style.cursor = `url(${cursorAdd}) 12 12, auto`;
      stage.on('mousedown', mouseDownHandler);
      stage.on('mousemove', mouseMoveHandler);
      stage.on('mouseup', mouseUpHandler);
    }

    return () => {
      if (stageRef.current) {
        const stage = stageRef.current.getStage();
        stage.container().style.cursor = 'default';
        stage.off('mousedown', mouseDownHandler);
        stage.off('mousemove', mouseMoveHandler);
        stage.off('mouseup', mouseUpHandler);
      }
    };
  }, [
    activeTool,
    setActiveTool,
    stageRef,
    addElement,
    updateElement,
    drawing,
    newElement,
  ]);

  return (
    <Button
      onPress={() => setActiveTool('rect')}
      variant={activeTool === 'rect' ? 'flat' : 'light'}
      color={activeTool === 'rect' ? 'primary' : 'default'}
      isIconOnly
      size="md"
    >
      <SquareIcon
        className={
          activeTool === 'rect' ? 'stroke-primary-500' : 'stroke-default-500'
        }
      />
    </Button>
  );
}

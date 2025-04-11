import { CircleIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { useEffect, useState } from 'react';
import {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
} from '@/app/lib/components/board/tools/drawingHandlers';
import cursorAdd from '@/app/lib/components/svg/cursorAdd';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';

export default function EllipseTool({
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

    if (activeTool === 'ellipse' && stageRef.current) {
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
    <FTooltip content={settingsStore.t.toolTips.tools.ellipseTool}>
      <Button
        onPress={() => {
          if (activeTool === 'ellipse') setActiveTool('');
          else setActiveTool('ellipse');
        }}
        variant={activeTool === 'ellipse' ? 'flat' : 'light'}
        color={activeTool === 'ellipse' ? 'primary' : 'default'}
        isIconOnly
        size="md"
      >
        <CircleIcon
          className={
            activeTool === 'ellipse'
              ? 'stroke-primary-500'
              : 'stroke-default-500'
          }
        />
      </Button>
    </FTooltip>
  );
}

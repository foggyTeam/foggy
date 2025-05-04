import { SquareIcon } from 'lucide-react';
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
import { ToolProps } from '@/app/lib/components/board/menu/toolBar';

export default function RectTool({
  activeTool,
  setActiveTool,
  stageRef,
  addElement,
  updateElement,
  activeColor,
}: ToolProps) {
  const [drawing, setDrawing] = useState(false);
  const [newElement, setNewElement] = useState(null);

  useEffect(() => {
    const mouseDownHandler = handleMouseDown({
      stageRef,
      activeTool,
      addElement,
      setDrawing,
      setNewElement,
      activeColor,
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
    activeColor,
  ]);

  return (
    <FTooltip content={settingsStore.t.toolTips.tools.rectTool}>
      <Button
        onPress={() => {
          if (activeTool === 'rect') setActiveTool('');
          else setActiveTool('rect');
        }}
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
    </FTooltip>
  );
}

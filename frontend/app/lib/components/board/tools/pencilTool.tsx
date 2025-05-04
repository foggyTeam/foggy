import { PencilIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { useEffect, useState } from 'react';
import {
  handleDrawing,
  handleEndDrawing,
  handleStartDrawing,
} from '@/app/lib/components/board/tools/drawingHandlers';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import { ToolProps } from '@/app/lib/components/board/menu/toolBar';
import cursorPencil from '@/app/lib/components/svg/cursorPencil';
import debounce from 'lodash/debounce';

export default function PencilTool({
  activeTool,
  setActiveTool,
  stageRef,
  addElement,
  updateElement,
  pencilParams,
  isDisabled,
}: ToolProps) {
  const [drawing, setDrawing] = useState(false);
  const [newElement, setNewElement] = useState(null);

  useEffect(() => {
    const mouseDownHandler = handleStartDrawing({
      stageRef,
      activeTool,
      addElement,
      setDrawing,
      setNewElement,
      pencilParams,
    } as any);

    const mouseMoveHandler = debounce(
      handleDrawing({
        stageRef,
        drawing,
        setNewElement,
        newElement,
        updateElement,
      } as any),
      2,
    );

    const mouseUpHandler = handleEndDrawing({
      drawing,
      newElement,
      setDrawing,
      setNewElement,
      updateElement,
    } as any);

    if (activeTool === 'pencil' && stageRef.current) {
      const stage = stageRef.current.getStage();
      stage.container().style.cursor = `url(${cursorPencil}) 0 24, auto`;
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
    pencilParams,
  ]);

  return (
    <FTooltip content={settingsStore.t.toolTips.tools.pencilTool}>
      <Button
        isDisabled={isDisabled}
        onPress={() => {
          if (activeTool === 'pencil') setActiveTool('');
          else setActiveTool('pencil');
        }}
        variant={activeTool === 'pencil' ? 'flat' : 'light'}
        color={activeTool === 'pencil' ? 'primary' : 'default'}
        isIconOnly
        size="md"
      >
        <PencilIcon
          className={
            activeTool === 'pencil'
              ? 'stroke-primary-500'
              : 'stroke-default-500'
          }
        />
      </Button>
    </FTooltip>
  );
}

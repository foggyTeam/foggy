import { EraserIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { useEffect, useState } from 'react';
import {
  handleEndErasing,
  handleErasing,
  handleStartErasing,
} from '@/app/lib/components/board/tools/drawingHandlers';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import { ToolProps } from '@/app/lib/components/board/menu/toolBar';
import debounce from 'lodash/debounce';
import cursorEraser from '@/app/lib/components/svg/cursorEraser';

export default function EraserTool({
  activeTool,
  setActiveTool,
  stageRef,
  removeElement,
  isDisabled,
}: ToolProps) {
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    const mouseDownHandler = handleStartErasing({
      stageRef,
      activeTool,
      setDrawing,
    } as any);

    const mouseMoveHandler = debounce(
      handleErasing({
        stageRef,
        activeTool,
        drawing,
        setDrawing,
        removeElement,
      } as any),
      5,
    );

    const mouseUpHandler = handleEndErasing({
      drawing,
      setDrawing,
    } as any);

    if (activeTool === 'eraser' && stageRef.current) {
      const stage = stageRef.current.getStage();
      stage.container().style.cursor = `url(${cursorEraser}) 0 24, auto`;
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
  }, [activeTool, setActiveTool, removeElement, stageRef, drawing]);

  return (
    <FTooltip content={settingsStore.t.toolTips.tools.pencilTool}>
      <Button
        isDisabled={isDisabled}
        onPress={() => {
          if (activeTool === 'eraser') setActiveTool('');
          else setActiveTool('eraser');
        }}
        variant={activeTool === 'eraser' ? 'flat' : 'light'}
        color={activeTool === 'eraser' ? 'primary' : 'default'}
        isIconOnly
        size="md"
      >
        <EraserIcon
          className={
            activeTool === 'eraser'
              ? 'stroke-primary-500'
              : 'stroke-default-500'
          }
        />
      </Button>
    </FTooltip>
  );
}

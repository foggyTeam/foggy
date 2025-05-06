import { EraserIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { useState } from 'react';
import {
  handleEndErasing,
  handleErasing,
  handleStartErasing,
} from '@/app/lib/components/board/tools/drawingHandlers';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import debounce from 'lodash/debounce';
import { useBoardContext } from '@/app/lib/components/board/boardContext';
import useTool from '@/app/lib/hooks/useTool';

export default function EraserTool() {
  const { stageRef, toolsDisabled, activeTool, setActiveTool, removeElement } =
    useBoardContext();
  const [drawing, setDrawing] = useState(false);

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
    4,
  );
  const mouseUpHandler = handleEndErasing({
    drawing,
    setDrawing,
  } as any);

  useTool({
    toolName: 'eraser',
    handlers: {
      mouseDownHandler,
      mouseMoveHandler,
      mouseUpHandler,
    },
  });

  return (
    <FTooltip content={settingsStore.t.toolTips.tools.pencilTool}>
      <Button
        isDisabled={toolsDisabled}
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

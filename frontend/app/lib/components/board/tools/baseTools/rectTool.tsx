import { SquareIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { useState } from 'react';
import {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
} from '@/app/lib/components/board/tools/drawingHandlers';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import { useBoardContext } from '@/app/lib/components/board/boardContext';
import useTool from '@/app/lib/hooks/useTool';

export default function RectTool() {
  const {
    stageRef,
    activeTool,
    setActiveTool,
    addElement,
    updateElement,
    toolsDisabled,
    allToolsDisabled,
  } = useBoardContext();

  const [drawing, setDrawing] = useState(false);
  const [newElement, setNewElement] = useState(null);

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

  useTool({
    toolName: 'rect',
    handlers: {
      mouseDownHandler,
      mouseMoveHandler,
      mouseUpHandler,
    },
  });

  return (
    <FTooltip content={settingsStore.t.toolTips.tools.rectTool}>
      <Button
        isDisabled={toolsDisabled || allToolsDisabled}
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

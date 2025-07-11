import { CircleIcon } from 'lucide-react';
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

export default function EllipseTool() {
  const {
    stageRef,
    toolsDisabled,
    activeTool,
    setActiveTool,
    addElement,
    updateElement,
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
    toolName: 'ellipse',
    handlers: {
      mouseDownHandler,
      mouseMoveHandler,
      mouseUpHandler,
    },
  });

  return (
    <FTooltip content={settingsStore.t.toolTips.tools.ellipseTool}>
      <Button
        isDisabled={toolsDisabled || allToolsDisabled}
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

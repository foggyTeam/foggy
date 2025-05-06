import { PencilIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { useState } from 'react';
import {
  handleDrawing,
  handleEndDrawing,
  handleStartDrawing,
  PencilParams,
} from '@/app/lib/components/board/tools/drawingHandlers';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import debounce from 'lodash/debounce';
import { useBoardContext } from '@/app/lib/components/board/boardContext';
import useTool from '@/app/lib/hooks/useTool';

export default function PencilTool({
  pencilParams,
}: {
  pencilParams: PencilParams;
}) {
  const {
    stageRef,
    activeTool,
    setActiveTool,
    addElement,
    updateElement,
    toolsDisabled,
  } = useBoardContext();

  const [drawing, setDrawing] = useState(false);
  const [newElement, setNewElement] = useState(null);

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
    4,
  );
  const mouseUpHandler = handleEndDrawing({
    drawing,
    newElement,
    setDrawing,
    setNewElement,
    updateElement,
  } as any);

  useTool({
    toolName: 'pencil',
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

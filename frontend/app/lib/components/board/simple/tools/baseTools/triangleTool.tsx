import { TriangleIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { useCallback, useState } from 'react';
import {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
} from '@/app/lib/components/board/simple/tools/drawingHandlers';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import { useBoardContext } from '@/app/lib/components/board/simple/boardContext';
import useTool from '@/app/lib/hooks/simpleBoard/useTool';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

export default function TriangleTool() {
  const { commonSize } = useAdaptiveParams();
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

  const mouseDownHandler = useCallback(
    handleMouseDown({
      stageRef,
      activeTool,
      addElement,
      setDrawing,
      setNewElement,
    } as any),
    [activeTool],
  );
  const mouseMoveHandler = useCallback(
    handleMouseMove({
      stageRef,
      drawing,
      newElement,
      updateElement,
    } as any),
    [drawing, newElement],
  );
  const mouseUpHandler = useCallback(
    handleMouseUp({
      drawing,
      setDrawing,
      setNewElement,
      setActiveTool,
    } as any),
    [drawing],
  );

  useTool({
    toolName: 'triangle',
    handlers: {
      mouseDownHandler,
      mouseMoveHandler,
      mouseUpHandler,
    },
  });

  return (
    <FTooltip content={settingsStore.t.toolTips.tools.triangleTool}>
      <Button
        data-testid="triangle-tool-btn"
        isDisabled={toolsDisabled || allToolsDisabled}
        onPress={() => {
          if (activeTool === 'triangle') setActiveTool('');
          else setActiveTool('triangle');
        }}
        variant={activeTool === 'triangle' ? 'flat' : 'light'}
        color={activeTool === 'triangle' ? 'primary' : 'default'}
        isIconOnly
        size={commonSize}
      >
        <TriangleIcon
          className={
            activeTool === 'triangle'
              ? 'stroke-primary-500'
              : 'stroke-default-600'
          }
        />
      </Button>
    </FTooltip>
  );
}

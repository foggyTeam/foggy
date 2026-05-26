import { ArrowRightIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { useCallback, useState } from 'react';
import {
  handleDrawing,
  handleEndDrawing,
  handleStartDrawing,
  PencilParams,
} from '@/app/lib/components/board/simple/tools/drawingHandlers';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import { useBoardContext } from '@/app/lib/components/board/simple/boardContext';
import useTool from '@/app/lib/hooks/simpleBoard/useTool';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

export default function ArrowTool({
  pencilParams,
}: {
  pencilParams: PencilParams;
}) {
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
    handleStartDrawing({
      stageRef,
      activeTool,
      addElement,
      setDrawing,
      setNewElement,
      pencilParams,
    } as any),
    [activeTool, pencilParams],
  );
  const mouseMoveHandler = useCallback(
    handleDrawing({
      stageRef,
      drawing,
      setNewElement,
      newElement,
      updateElement,
    } as any),
    [drawing, newElement],
  );
  const mouseUpHandler = useCallback(
    handleEndDrawing({
      drawing,
      newElement,
      setDrawing,
      setNewElement,
      updateElement,
    } as any),
    [drawing, newElement],
  );

  useTool({
    toolName: 'arrow',
    handlers: {
      mouseDownHandler,
      mouseMoveHandler,
      mouseUpHandler,
    },
  });

  return (
    <FTooltip content={settingsStore.t.toolTips.tools.arrowTool}>
      <Button
        data-testid="arrow-tool-btn"
        isDisabled={toolsDisabled || allToolsDisabled}
        onPress={() => {
          if (activeTool === 'arrow') setActiveTool('');
          else setActiveTool('arrow');
        }}
        variant={activeTool === 'arrow' ? 'flat' : 'light'}
        color={activeTool === 'arrow' ? 'primary' : 'default'}
        isIconOnly
        size={commonSize}
      >
        <ArrowRightIcon
          className={
            activeTool === 'arrow'
              ? 'stroke-primary-500 -rotate-45'
              : 'stroke-default-600 -rotate-45'
          }
        />
      </Button>
    </FTooltip>
  );
}

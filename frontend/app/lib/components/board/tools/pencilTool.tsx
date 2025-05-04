import { PencilIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { useEffect, useState } from 'react';
import {
  handleDrawing,
  handleEndDrawing,
  handleStartDrawing,
  PencilParams,
} from '@/app/lib/components/board/tools/drawingHandlers';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import { ToolProps } from '@/app/lib/components/board/menu/toolBar';
import cursorPencil from '@/app/lib/components/svg/cursorPencil';
import { debounce } from 'lodash';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import PencilToolBar from '@/app/lib/components/board/menu/pencilToolBar';
import { foggy_accent } from '@/tailwind.config';

export default function PencilTool({
  activeTool,
  setActiveTool,
  stageRef,
  addElement,
  updateElement,
}: ToolProps) {
  const [drawing, setDrawing] = useState(false);
  const [newElement, setNewElement] = useState(null);
  const [pencilParams, setPencilParams] = useState<PencilParams>({
    color: foggy_accent.DEFAULT,
    width: 2,
    tension: 0.5,
    lineJoin: 'round',
    lineCap: 'round',
  });

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
      5,
    );

    const mouseUpHandler = handleEndDrawing({
      drawing,
      setDrawing,
      setNewElement,
      setActiveTool,
    } as any);

    if (activeTool === 'pencil' && stageRef.current) {
      const stage = stageRef.current.getStage();
      stage.container().style.cursor = `url(${cursorPencil}) 12 12, auto`;
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
    <Popover>
      <PopoverTrigger>
        <Button
          onPress={() => {
            if (activeTool === 'pencil') setActiveTool('');
            else setActiveTool('pencil');
          }}
          variant={activeTool === 'pencil' ? 'flat' : 'light'}
          color={activeTool === 'pencil' ? 'primary' : 'default'}
          isIconOnly
          size="md"
        >
          <FTooltip content={settingsStore.t.toolTips.tools.pencilTool}>
            <PencilIcon
              className={
                activeTool === 'pencil'
                  ? 'stroke-primary-500'
                  : 'stroke-default-500'
              }
            />
          </FTooltip>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={clsx(
          bg_container_no_padding,
          'flex w-fit flex-col gap-2 p-2 sm:p-3',
        )}
      >
        <PencilToolBar
          pencilParams={pencilParams}
          setPencilParams={setPencilParams}
        />
      </PopoverContent>
    </Popover>
  );
}

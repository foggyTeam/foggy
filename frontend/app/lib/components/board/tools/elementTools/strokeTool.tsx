import { CircleDashedIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { useEffect, useState } from 'react';
import { primary, to_rgb } from '@/tailwind.config';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import { BoardElement } from '@/app/lib/types/definitions';
import { Slider } from '@heroui/slider';
import settingsStore from '@/app/stores/settingsStore';
import ColorPicker from '@/app/lib/components/board/tools/colorPicker';
import { isElementVisible } from '@/app/lib/components/board/tools/drawingHandlers';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import { useBoardContext } from '@/app/lib/components/board/boardContext';
import { addToast } from '@heroui/toast';

export default function StrokeTool() {
  const { selectedElement, updateElement } = useBoardContext();
  const [strokeColor, changeColor] = useState(
    selectedElement.attrs.stroke || '',
  );
  const [strokeWidth, changeWidth] = useState(
    selectedElement.attrs.strokeWidth || 0,
  );

  useEffect(() => {
    if (strokeColor !== (selectedElement.attrs.stroke || ''))
      changeColor(selectedElement.attrs.stroke || '');
    if (strokeWidth !== (selectedElement.attrs.strokeWidth || 0))
      changeWidth(selectedElement.attrs.strokeWidth || 0);
  }, [selectedElement]);

  useEffect(() => {
    if (selectedElement.attrs.type !== 'text') {
      if (
        isElementVisible(
          selectedElement.attrs.type,
          selectedElement.attrs.fill,
          strokeColor,
          strokeWidth,
        )
      )
        updateElement(selectedElement.attrs.id, {
          strokeWidth: strokeWidth,
          stroke:
            strokeColor &&
            (strokeColor.length === 7 || strokeColor.length === 9)
              ? strokeColor
              : primary.DEFAULT,
        } as BoardElement);
      else
        addToast({
          color: 'warning',
          severity: 'warning',
          title: settingsStore.t.toasts.board.boardElementInvisible,
        });
    } else {
      if (
        isElementVisible(
          selectedElement.attrs.type,
          primary.DEFAULT,
          strokeColor,
          strokeWidth,
        )
      ) {
        updateElement(selectedElement.attrs.id, {
          strokeWidth: strokeWidth,
          stroke:
            strokeColor &&
            (strokeColor.length === 7 || strokeColor.length === 9)
              ? strokeColor
              : primary.DEFAULT,
        } as Partial<BoardElement>);
      } else {
        updateElement(selectedElement.attrs.id, {
          strokeWidth: undefined,
          stroke: undefined,
        } as Partial<BoardElement>);
      }
    }
  }, [strokeColor, strokeWidth]);

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="light" color="default" isIconOnly size="md">
          <FTooltip content={settingsStore.t.toolTips.tools.strokeTool}>
            <CircleDashedIcon
              stroke={`rgb(${to_rgb(strokeColor ? strokeColor : primary.DEFAULT)})`}
            />
          </FTooltip>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={clsx(
          bg_container_no_padding,
          'flex w-fit flex-col gap-2 px-1 py-2 sm:px-1 sm:py-3',
        )}
      >
        <Slider
          value={strokeWidth}
          onChange={(value: number | number[]) =>
            changeWidth(Array.isArray(value) ? value[0] : value)
          }
          label={settingsStore.t.toolBar.strokeWidth}
          className="w-[89.2%]"
          size="md"
          showOutline
          showTooltip
          maxValue={20}
          minValue={0}
          step={0.5}
        />
        <ColorPicker value={strokeColor} changeValue={changeColor} />
      </PopoverContent>
    </Popover>
  );
}

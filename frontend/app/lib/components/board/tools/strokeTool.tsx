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

export default function StrokeTool({ element, updateElement }) {
  const [strokeColor, changeColor] = useState(primary.DEFAULT);
  const [strokeWidth, changeWidth] = useState(0);

  useEffect(() => {
    changeColor(
      element.attrs.stroke && element.attrs.strokeWidth
        ? element.attrs.stroke
        : primary.DEFAULT,
    );
    changeWidth(element.attrs.strokeWidth ? element.attrs.strokeWidth : 0);
  }, [element]);

  useEffect(() => {
    if (element.attrs.type !== 'text') {
      if (
        isElementVisible(
          element.attrs.type,
          element.attrs.fill,
          strokeColor,
          strokeWidth,
        )
      )
        updateElement(element.attrs.id, {
          strokeWidth: strokeWidth,
          stroke:
            strokeColor &&
            (strokeColor.length === 7 || strokeColor.length === 9)
              ? strokeColor
              : primary.DEFAULT,
        } as BoardElement);
      else console.log('Element is invisible!');
    } else {
      if (
        isElementVisible(
          element.attrs.type,
          primary.DEFAULT,
          strokeColor,
          strokeWidth,
        )
      ) {
        updateElement(element.attrs.id, {
          strokeWidth: strokeWidth,
          stroke:
            strokeColor &&
            (strokeColor.length === 7 || strokeColor.length === 9)
              ? strokeColor
              : primary.DEFAULT,
        } as BoardElement);
      } else {
        updateElement(element.attrs.id, {
          strokeWidth: undefined,
          stroke: undefined,
        } as BoardElement);
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
          onChange={changeWidth}
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

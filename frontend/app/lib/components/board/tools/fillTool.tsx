import { CircleIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { useEffect, useState } from 'react';
import { primary, to_rgb } from '@/tailwind.config';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import { BoardElement } from '@/app/lib/types/definitions';
import ColorPicker from '@/app/lib/components/board/tools/colorPicker';
import { isElementVisible } from '@/app/lib/components/board/tools/drawingHandlers';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';

export default function FillTool({ element, updateElement }) {
  const [fillColor, changeColor] = useState(primary.DEFAULT);
  useEffect(() => {
    changeColor(element.attrs.fill ? element.attrs.fill : primary.DEFAULT);
  }, [element]);

  useEffect(() => {
    if (
      (fillColor.length === 7 || fillColor.length === 9) &&
      isElementVisible(
        element.attrs.type,
        fillColor,
        element.attrs.stroke,
        element.attrs.strokeWidth,
      )
    )
      updateElement(element.attrs.id, {
        fill: fillColor,
      } as BoardElement);
    else console.log('Element is invisible!');
  }, [fillColor]);

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="light" color="default" isIconOnly size="md">
          <FTooltip content={settingsStore.t.toolTips.tools.fillTool}>
            <CircleIcon
              fill={fillColor}
              stroke={`rgba(${to_rgb(fillColor)}, .48)`}
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
        <ColorPicker color={fillColor} changeColor={changeColor} />
      </PopoverContent>
    </Popover>
  );
}

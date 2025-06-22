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
import { useBoardContext } from '@/app/lib/components/board/boardContext';
import { addToast } from '@heroui/toast';

export default function FillTool() {
  const { selectedElement, updateElement, allToolsDisabled } =
    useBoardContext();
  const [fillColor, changeColor] = useState(selectedElement.attrs.fill || '');

  useEffect(() => {
    if (fillColor === (selectedElement.attrs.fill || '')) return;
    changeColor(selectedElement.attrs.fill || '');
  }, [selectedElement]);

  useEffect(() => {
    if (selectedElement.attrs.type !== 'text') {
      if (
        (fillColor.length === 7 || fillColor.length === 9) &&
        isElementVisible(
          selectedElement.attrs.type,
          fillColor,
          selectedElement.attrs.stroke,
          selectedElement.attrs.strokeWidth,
        )
      )
        updateElement(selectedElement.attrs.id, {
          fill: fillColor,
        } as BoardElement);
      else
        addToast({
          color: 'warning',
          severity: 'warning',
          title: settingsStore.t.toasts.board.boardElementInvisible,
        });
    } else
      updateElement(selectedElement.attrs.id, {
        fill: isElementVisible(
          selectedElement.attrs.type,
          fillColor,
          primary.DEFAULT,
          1,
        )
          ? fillColor
          : undefined,
      } as BoardElement);
  }, [fillColor]);

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          isDisabled={allToolsDisabled}
          variant="light"
          color="default"
          isIconOnly
          size="md"
        >
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
        <ColorPicker value={fillColor} changeValue={changeColor} />
      </PopoverContent>
    </Popover>
  );
}

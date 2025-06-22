import {
  MoveHorizontalIcon,
  MoveVerticalIcon,
  RefreshCwIcon,
  RulerIcon,
  ScanIcon,
} from 'lucide-react';
import { Button } from '@heroui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import { useEffect, useState } from 'react';
import { NumberInput } from '@heroui/number-input';
import settingsStore from '@/app/stores/settingsStore';
import { BoardElement } from '@/app/lib/types/definitions';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import { useBoardContext } from '@/app/lib/components/board/boardContext';

export default function SizeTool() {
  const { selectedElement, updateElement, allToolsDisabled } =
    useBoardContext();

  const [width, setWidth] = useState(selectedElement.attrs.width);
  const [height, setHeight] = useState(selectedElement.attrs.height);
  const [cornerRadius, setCornerRadius] = useState(
    selectedElement.attrs.cornerRadius || 0,
  );
  const [rotation, setRotation] = useState(selectedElement.attrs.rotation);

  useEffect(() => {
    if (
      selectedElement.attrs.width != width ||
      selectedElement.attrs.height != height
    ) {
      if (selectedElement.attrs.type === 'ellipse') {
        setWidth(selectedElement.attrs.radiusX * 2);
        setHeight(selectedElement.attrs.radiusY * 2);
      } else {
        setWidth(selectedElement.attrs.width);
        setHeight(selectedElement.attrs.height);
      }
    }
    if (selectedElement.attrs.cornerRadius != cornerRadius)
      setCornerRadius(selectedElement.attrs.cornerRadius || 0);
    if (selectedElement.attrs.rotation != rotation)
      setRotation(selectedElement.attrs.rotation);
  }, [selectedElement]);

  useEffect(() => {
    if (width || height)
      updateElement(selectedElement.attrs.id, {
        width: width ? width : 16,
        height: height ? height : 16,
      } as BoardElement);
  }, [width, height]);

  useEffect(() => {
    updateElement(selectedElement.attrs.id, {
      cornerRadius: cornerRadius,
    } as BoardElement);
  }, [cornerRadius]);

  useEffect(() => {
    updateElement(selectedElement.attrs.id, {
      rotation: rotation,
    } as BoardElement);
  }, [rotation]);

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
          <FTooltip content={settingsStore.t.toolTips.tools.sizeTool}>
            <RulerIcon className="stroke-default-500" />
          </FTooltip>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={clsx(
          bg_container_no_padding,
          'flex w-fit flex-col gap-2 p-2 sm:p-3',
        )}
      >
        <div className="flex gap-2">
          <NumberInput
            minValue={4}
            maxValue={512}
            value={width}
            onValueChange={setWidth}
            startContent={<MoveHorizontalIcon className="stroke-default-500" />}
            label={settingsStore.t.toolBar.width}
            className="max-w-32"
          />
          <NumberInput
            minValue={4}
            maxValue={512}
            value={height}
            onValueChange={setHeight}
            startContent={<MoveVerticalIcon className="stroke-default-500" />}
            label={settingsStore.t.toolBar.height}
            className="max-w-32"
          />
        </div>
        <div className="flex gap-2">
          <NumberInput
            minValue={0}
            maxValue={128}
            value={cornerRadius}
            onValueChange={setCornerRadius}
            startContent={<ScanIcon className="stroke-default-500" />}
            label={settingsStore.t.toolBar.cornerRadius}
            className="max-w-32"
          />
          <NumberInput
            minValue={-359}
            maxValue={359}
            value={rotation}
            onValueChange={setRotation}
            startContent={<RefreshCwIcon className="stroke-default-500" />}
            label={settingsStore.t.toolBar.rotation}
            className="max-w-32"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

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

export default function SizeTool({ element, updateElement }) {
  const [width, setWidth] = useState(undefined as any);
  const [height, setHeight] = useState(undefined as any);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (element.attrs.type !== 'text') {
      if (element.attrs.type === 'ellipse') {
        setWidth(element.attrs.radiusX * 2);
        setHeight(element.attrs.radiusY * 2);
      } else {
        setWidth(element.attrs.width);
        setHeight(element.attrs.height);
      }
      setCornerRadius(
        element.attrs.cornerRadius ? element.attrs.cornerRadius : 0,
      );
      setRotation(element.attrs.rotation);
    } else {
      setRotation(element.attrs.rotation);
    }
  }, [element]);

  useEffect(() => {
    if (width || height)
      updateElement(element.attrs.id, {
        width: width ? width : 16,
        height: height ? height : 16,
      } as BoardElement);
  }, [width, height]);

  useEffect(() => {
    updateElement(element.attrs.id, {
      cornerRadius: cornerRadius,
    } as BoardElement);
  }, [cornerRadius]);

  useEffect(() => {
    updateElement(element.attrs.id, {
      rotation: rotation,
    } as BoardElement);
  }, [rotation]);

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="light" color="default" isIconOnly size="md">
          <RulerIcon className="stroke-default-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={clsx(
          bg_container_no_padding,
          'flex w-fit flex-col gap-2 p-2 sm:p-3',
        )}
      >
        <div className="flex gap-2">
          {element.attrs.type !== 'text' && (
            <NumberInput
              minValue={4}
              maxValue={512}
              value={width}
              onValueChange={setWidth}
              startContent={
                <MoveHorizontalIcon className="stroke-default-500" />
              }
              label={settingsStore.t.toolBar.width}
              className="max-w-32"
            />
          )}
          {element.attrs.type !== 'text' && (
            <NumberInput
              minValue={4}
              maxValue={512}
              value={height}
              onValueChange={setHeight}
              startContent={<MoveVerticalIcon className="stroke-default-500" />}
              label={settingsStore.t.toolBar.height}
              className="max-w-32"
            />
          )}
        </div>
        <div className="flex gap-2">
          {element.attrs.type !== 'text' && (
            <NumberInput
              minValue={0}
              maxValue={128}
              value={cornerRadius}
              onValueChange={setCornerRadius}
              startContent={<ScanIcon className="stroke-default-500" />}
              label={settingsStore.t.toolBar.cornerRadius}
              className="max-w-32"
            />
          )}
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

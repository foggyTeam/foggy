import { Button } from '@heroui/button';
import React, { JSX, useEffect, useState } from 'react';
import clsx from 'clsx';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import { bg_container_no_padding } from '@/app/lib/types/styles';

const to_rgba = (hex: string): string => {
  hex = hex.replace(/^#/, '');

  if (hex.length === 3 || hex.length === 4) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;

  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const to_hex = (rgba: string): string => {
  const result = /^rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([01]?\.?\d*)?\)$/.exec(
    rgba,
  );
  if (!result || !rgba) {
    return '#171717';
  }

  const r = parseInt(result[1], 10);
  const g = parseInt(result[2], 10);
  const b = parseInt(result[3], 10);
  const a = result[4] ? Math.round(parseFloat(result[4]) * 255) : 255;

  // Преобразуем значения RGB и Alpha в HEX
  const hexR = r.toString(16).padStart(2, '0');
  const hexG = g.toString(16).padStart(2, '0');
  const hexB = b.toString(16).padStart(2, '0');
  const hexA = a.toString(16).padStart(2, '0');

  return `#${hexR}${hexG}${hexB}${hexA}`;
};

export default function EditorToolButton({
  id,
  value,
  Icon,
  handleClick,
  isAccent,
  saveSelection,
  restoreSelection,
  popover = false,
  PopoverInnerContent,
}: {
  id?: string;
  value: string | number | boolean;
  Icon: JSX.Element;
  isAccent: boolean;
  popover?: boolean;
  PopoverInnerContent?;
}) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(
      id === 'color' || id === 'background' ? to_hex(value as string) : value,
    );
  }, [value]);

  const handlePopoverClose = () => {
    restoreSelection();
    let newValue = localValue;
    if (id === 'color' || id === 'background') {
      newValue = (
        localValue === to_hex(value as string)
          ? undefined
          : to_rgba(localValue as string)
      ) as any;
    }

    setTimeout(() => handleClick(id, newValue, 180));
  };

  return popover ? (
    <Popover onClose={handlePopoverClose}>
      <PopoverTrigger>
        <Button
          onPress={() => {
            saveSelection();
          }}
          id={id}
          variant="light"
          isIconOnly
          size="sm"
        >
          <Icon
            className={clsx(
              'h-5 w-5',
              isAccent ? 'stroke-f_accent' : 'stroke-default-500',
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={clsx(
          bg_container_no_padding,
          'flex w-fit flex-col gap-2 px-1 py-2 sm:px-1 sm:py-3',
        )}
      >
        <PopoverInnerContent value={localValue} changeValue={setLocalValue} />
      </PopoverContent>
    </Popover>
  ) : (
    <Button
      id={id}
      onPress={() => handleClick(id, value)}
      variant="light"
      isIconOnly
      size="sm"
    >
      <Icon
        className={clsx(
          'h-5 w-5',
          isAccent ? 'stroke-f_accent' : 'stroke-default-500',
        )}
      />
    </Button>
  );
}

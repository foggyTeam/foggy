import { Button } from '@heroui/button';
import React, { JSX, useEffect, useState } from 'react';
import clsx from 'clsx';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import { bg_container_no_padding } from '@/app/lib/types/styles';

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
    setLocalValue(value);
  }, [value]);

  const handlePopoverClose = () => {
    restoreSelection();
    setTimeout(() => handleClick(id, localValue), 180);
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

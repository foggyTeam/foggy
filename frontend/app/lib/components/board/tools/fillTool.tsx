import { CircleIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { useEffect, useState } from 'react';
import { info, to_rgb } from '@/tailwind.config';
import { BoardElement } from '@/app/lib/types/definitions';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import settingsStore from '@/app/stores/settingsStore';
import { HslaColorPicker } from 'react-colorful';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';

export default function FillTool({ element, updateElement }) {
  const [fillColor, changeColor] = useState('#ffffff');
  useEffect(() => {
    changeColor(element.attrs.fill ? element.attrs.fill : element.attrs.stroke);
  }, [element]);

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          onPress={() => {
            updateElement(element.attrs.id, {
              fill: info.DEFAULT,
            } as BoardElement);
          }}
          variant="light"
          color="default"
          isIconOnly
          size="md"
        >
          <CircleIcon
            fill={fillColor}
            stroke={`rgba(${to_rgb(fillColor)}, .48)`}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={clsx(
          bg_container_no_padding,
          'flex flex-col gap-1 p-2 sm:p-3',
        )}
      >
        <h3 className="w-full justify-start text-small font-medium text-default-800">
          {settingsStore.t.toolBar.chooseColor}
        </h3>
        <HslaColorPicker className="gap-1 rounded-md" />
      </PopoverContent>
    </Popover>
  );
}

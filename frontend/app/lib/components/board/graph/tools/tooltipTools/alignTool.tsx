'use client';

import { Button } from '@heroui/button';
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
} from 'lucide-react';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/dropdown';
import React from 'react';

const options: { value: string; Icon: any }[] = [
  { value: 'start', Icon: AlignLeftIcon },
  { value: 'center', Icon: AlignCenterIcon },
  { value: 'end', Icon: AlignRightIcon },
];

export default function AlignTool({
  align,
  setAlign,
}: {
  align: 'start' | 'center' | 'end';
  setAlign: (value: 'start' | 'center' | 'end') => void;
}) {
  const { commonSize } = useAdaptiveParams();
  const { allToolsDisabled } = useGraphBoardContext();

  return (
    <Dropdown
      classNames={{ content: `${bg_container_no_padding} w-fit min-w-20` }}
    >
      <DropdownTrigger>
        <Button
          isDisabled={allToolsDisabled}
          variant="light"
          isIconOnly
          size={commonSize}
        >
          <AlignJustifyIcon className="stroke-default-600" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        selectedKeys={new Set([align])}
        selectionMode="single"
        variant="flat"
        onSelectionChange={(keys) => setAlign([...keys][0])}
        closeOnSelect
        classNames={{ base: 'w-fit px-1 py-2 sm:px-1 sm:py-3', list: 'w-20' }}
      >
        {options.map(({ value, Icon }) => (
          <DropdownItem
            textValue={value}
            key={value}
            startContent={
              <Icon
                className={clsx(
                  align === value ? 'stroke-f_accent' : 'stroke-default-600',
                )}
              />
            }
          />
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

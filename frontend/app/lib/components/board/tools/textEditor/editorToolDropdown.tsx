import React, { useEffect, useState } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/dropdown';
import { Button } from '@heroui/button';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';

export default function EditorToolDropdown({
  id,
  options,
  activeOption,
  Icon,
  handleClick,
  isAccent,
}: {
  id?: string;
  options: any[];
  activeOption: any;
  Icon: React.ComponentType<any>;
  handleClick: any;
  isAccent: boolean;
}) {
  const [selectedOption, setSelectedOption] = useState(activeOption);

  useEffect(() => {
    let newValue = selectedOption?.values().next().value;
    if (newValue) {
      if (parseInt(newValue)) newValue = parseInt(newValue);
      handleClick(id, newValue);
    }
  }, [selectedOption]);

  const reset = () => {
    let newValue = selectedOption?.values().next().value;
    if (newValue) {
      if (parseInt(newValue)) newValue = parseInt(newValue);
      if (newValue === activeOption) handleClick(id, undefined);
    }
  };

  return (
    <Dropdown
      classNames={{
        content: `${bg_container_no_padding} w-fit min-w-20`,
      }}
      onClose={() => requestAnimationFrame(reset)}
    >
      <DropdownTrigger>
        <Button id={id} variant="light" isIconOnly size="sm">
          <Icon
            className={clsx(
              'h-5 w-5',
              isAccent ? 'stroke-f_accent' : 'stroke-default-500',
            )}
          />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        selectedKeys={selectedOption?.value}
        selectionMode="single"
        variant="flat"
        onSelectionChange={setSelectedOption}
        closeOnSelect={false}
        // hideSelectedIcon
        classNames={{
          base: clsx('w-fit px-1 py-2 sm:px-1 sm:py-3'),
          list: 'w-20',
        }}
      >
        {options.map(({ value, ToolIcon }) => {
          return (
            <DropdownItem
              startContent={
                <ToolIcon
                  className={clsx(
                    'h-5 w-5',
                    activeOption == value
                      ? 'stroke-f_accent'
                      : 'stroke-default-500',
                  )}
                />
              }
              key={value}
              textValue={value}
            />
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
}

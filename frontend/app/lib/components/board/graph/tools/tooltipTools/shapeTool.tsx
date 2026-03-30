'use client';

import { Button } from '@heroui/button';
import {
  CircleIcon,
  DiamondIcon,
  PentagonIcon,
  RectangleHorizontalIcon,
  ShapesIcon,
  TriangleIcon,
} from 'lucide-react';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';
import { GCustomNode } from '@/app/lib/types/definitions';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/dropdown';
import React from 'react';

type ShapeType = GCustomNode['data']['shape'];
const options: { value: ShapeType; Icon: React.ComponentType }[] = [
  { value: 'rect', Icon: RectangleHorizontalIcon },
  { value: 'circle', Icon: CircleIcon },
  { value: 'diamond', Icon: DiamondIcon },
  { value: 'pentagon', Icon: PentagonIcon },
  { value: 'triangle', Icon: TriangleIcon },
];

export default function ShapeTool({
  shape,
  setShape,
}: {
  shape: ShapeType;
  setShape: (value: ShapeType) => void;
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
          <ShapesIcon className="stroke-default-600" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        selectedKeys={new Set([shape])}
        selectionMode="single"
        variant="flat"
        onSelectionChange={(keys) => setShape([...keys][0] as ShapeType)}
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
                  shape === value ? 'stroke-f_accent' : 'stroke-default-600',
                )}
              />
            }
          />
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

'use client';

import { Button } from '@heroui/button';
import { CircleDashedIcon, EllipsisIcon, MinusIcon } from 'lucide-react';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import { GEdge } from '@/app/lib/types/definitions';
import React, { useEffect, useState } from 'react';
import { Edge } from '@xyflow/react';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/dropdown';
import clsx from 'clsx';
import { Checkbox } from '@heroui/checkbox';

const optionsMap = {
  solid: {
    value: {
      strokeDasharray: undefined,
      strokeLinecap: undefined,
      strokeWidth: 1.5,
    },
    Icon: MinusIcon,
  },
  dashed: {
    value: {
      strokeDasharray: '5 5',
      strokeLinecap: undefined,
      strokeWidth: 1.5,
    },
    Icon: CircleDashedIcon,
  },
  dotted: {
    value: {
      strokeDasharray: '0.25 10',
      strokeLinecap: 'round',
      strokeWidth: 2,
    },
    Icon: EllipsisIcon,
  },
};
const options = Object.keys(optionsMap);

function defineOption(style: Edge['style']) {
  switch (style?.strokeDasharray) {
    case '5 5':
      return 'dashed';
    case '0.25 10':
      return 'dotted';
    default:
      return 'solid';
  }
}

export default function LineStyleTool({
  edge,
  onChange,
}: {
  edge: GEdge;
  onChange: (patch: Partial<Pick<GEdge, 'style' | 'animated'>>) => void;
}) {
  const { commonSize, smallerSize } = useAdaptiveParams();
  const { allToolsDisabled } = useGraphBoardContext();
  const [animated, setAnimated] = useState(!!edge.animated);
  const [currentOption, setCurrentOption] = useState(
    new Set([defineOption(edge.style)]),
  );

  const handleChange = (keys: any) => {
    const value = Object.values(keys)[0];
    setCurrentOption(keys);
    if (value === 'solid') setAnimated(false);
    onChange({
      style: { ...edge.style, ...optionsMap[value as typeof options].value },
    });
  };

  useEffect(() => {
    onChange({ animated });
  }, [animated]);

  return (
    <Dropdown
      classNames={{ content: `${bg_container_no_padding} w-fit min-w-20` }}
    >
      <DropdownTrigger>
        <Button
          data-testid="edge-dash-tool-btn"
          isDisabled={allToolsDisabled}
          variant="light"
          color="default"
          isIconOnly
          size={commonSize}
        >
          <FTooltip content={settingsStore.t.toolTips.tools.edgeDash}>
            <CircleDashedIcon className="stroke-default-600" />
          </FTooltip>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        selectedKeys={currentOption}
        selectionMode="single"
        variant="flat"
        onSelectionChange={handleChange}
        closeOnSelect
        classNames={{ base: 'w-fit px-1 py-2 sm:px-1 sm:py-3', list: 'w-full' }}
        bottomContent={
          <Checkbox
            className="mx-0.5 mt-0.5"
            isDisabled={currentOption.has('solid')}
            size={smallerSize}
            isSelected={animated}
            onValueChange={setAnimated}
          >
            {settingsStore.t.toolBar.animateEdge}
          </Checkbox>
        }
      >
        {options.map((key) => {
          const Icon = optionsMap[key].Icon;
          return (
            <DropdownItem
              textValue={key}
              key={key}
              startContent={
                <Icon
                  className={clsx(
                    [...currentOption.keys()][0] === key
                      ? 'stroke-f_accent'
                      : 'stroke-default-600',
                  )}
                />
              }
            />
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
}

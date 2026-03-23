'use client';

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/dropdown';
import { Button } from '@heroui/button';
import {
  MinusIcon,
  MoveHorizontalIcon,
  MoveLeftIcon,
  MoveRightIcon,
} from 'lucide-react';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import clsx from 'clsx';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import { GEdge } from '@/app/lib/types/definitions';
import { MarkerType } from '@xyflow/react';
import React, { useState } from 'react';

type ArrowVariant = 'none' | 'end' | 'start' | 'both';

const options: {
  value: ArrowVariant;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: 'none', Icon: MinusIcon },
  { value: 'both', Icon: MoveHorizontalIcon },
  { value: 'end', Icon: MoveRightIcon },
  { value: 'start', Icon: MoveLeftIcon },
];

function defineOption(
  startMarker: MarkerType | undefined,
  endMarker: MarkerType | undefined,
): ArrowVariant {
  const hasStart = !!startMarker;
  const hasEnd = !!endMarker;
  if (hasStart && hasEnd) return 'both';
  if (hasStart) return 'start';
  if (hasEnd) return 'end';
  return 'none';
}

export default function EndsTool({
  edge,
  onChange,
}: {
  edge: GEdge;
  onChange: (patch: Partial<Pick<GEdge, 'markerStart' | 'markerEnd'>>) => void;
}) {
  const { commonSize } = useAdaptiveParams();
  const { allToolsDisabled } = useGraphBoardContext();

  const [currentOption, setCurrentOption] = useState(
    new Set([defineOption(edge.markerStart, edge.markerEnd)]),
  );

  const CurrentIcon =
    options.find((o) => o.value === currentOption.keys()[0])?.Icon ?? MinusIcon;

  const getArrow = () => {
    return {
      type: MarkerType.ArrowClosed,
      width: 32,
      color: edge.style?.stroke || 'hsl(var(--heroui-default-400))',
    };
  };

  const handleChange = (keys) => {
    const value = Object.values(keys)[0];
    setCurrentOption(keys);
    onChange({
      markerStart:
        value === 'start' || value === 'both' ? getArrow() : undefined,
      markerEnd: value === 'end' || value === 'both' ? getArrow() : undefined,
    });
  };
  return (
    <Dropdown
      classNames={{ content: `${bg_container_no_padding} w-fit min-w-20` }}
    >
      <DropdownTrigger>
        <Button
          data-testid="edge-arrow-tool-btn"
          isDisabled={allToolsDisabled}
          variant="light"
          isIconOnly
          size={commonSize}
        >
          <FTooltip content={settingsStore.t.toolTips.tools.edgeArrow}>
            <CurrentIcon className="stroke-default-600" />
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
        classNames={{ base: 'w-fit px-1 py-2 sm:px-1 sm:py-3', list: 'w-20' }}
      >
        {options.map(({ value, Icon }) => (
          <DropdownItem
            textValue={value}
            key={value}
            startContent={
              <Icon
                className={clsx(
                  currentOption.keys()[0] === value
                    ? 'stroke-f_accent'
                    : 'stroke-default-600',
                )}
              />
            }
          />
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

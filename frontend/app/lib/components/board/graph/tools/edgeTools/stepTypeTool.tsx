'use client';

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/dropdown';
import { Button } from '@heroui/button';
import {
  CornerRightDownIcon,
  MoveDownRightIcon,
  RedoIcon,
  SplineIcon,
  TrendingDownIcon,
} from 'lucide-react';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import clsx from 'clsx';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import { GEdge } from '@/app/lib/types/definitions';
import React from 'react';

type EdgeType = GEdge['type'];

const options: {
  value: EdgeType;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: 'default', Icon: RedoIcon },
  { value: 'smoothstep', Icon: CornerRightDownIcon },
  { value: 'step', Icon: TrendingDownIcon },
  { value: 'straight', Icon: MoveDownRightIcon },
];

export default function StepTypeTool({
  edge,
  onChange,
}: {
  edge: GEdge;
  onChange: (patch: Partial<Pick<GEdge, 'type'>>) => void;
}) {
  const { commonSize } = useAdaptiveParams();
  const { allToolsDisabled } = useGraphBoardContext();

  const CurrentIcon =
    options.find((o) => o.value === edge.type)?.Icon ?? SplineIcon;

  return (
    <Dropdown
      classNames={{ content: `${bg_container_no_padding} w-fit min-w-20` }}
    >
      <DropdownTrigger>
        <Button
          data-testid="edge-type-tool-btn"
          isDisabled={allToolsDisabled}
          variant="light"
          isIconOnly
          size={commonSize}
        >
          <FTooltip content={settingsStore.t.toolTips.tools.edgeType}>
            <CurrentIcon className="stroke-default-600" />
          </FTooltip>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        selectedKeys={new Set([edge.type])}
        selectionMode="single"
        variant="flat"
        onSelectionChange={(keys) =>
          onChange({ type: [...keys][0] as EdgeType })
        }
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
                  edge.type === value
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

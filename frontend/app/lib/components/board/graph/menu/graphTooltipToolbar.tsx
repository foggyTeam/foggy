'use client';

import React, { JSX } from 'react';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import settingsStore from '@/app/stores/settingsStore';
import { Button } from '@heroui/button';
import { PencilIcon } from 'lucide-react';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';

export default function GraphTooltipToolbar({
  isOpen,
  toggleEdit,
  tools,
}: {
  isOpen: boolean;
  toggleEdit?: () => void;
  tools?: JSX.Element;
}) {
  const { commonSize } = useAdaptiveParams();

  return (
    <div
      className={clsx(
        'absolute -top-14 right-0 z-30 w-fit p-1 transition-all duration-100 sm:z-50',
        bg_container_no_padding,
        'flex justify-center gap-1 overflow-visible',
        isOpen
          ? 'scale-100 opacity-100'
          : 'pointer-events-none scale-75 opacity-0',
      )}
      data-testid="board-tooltip-toolbar"
    >
      {tools}
      <FTooltip content={settingsStore.t.toolTips.tools.toggleEdit}>
        <Button
          data-testid="toggle-edit-mode-btn"
          onPress={toggleEdit}
          variant="light"
          color="default"
          isIconOnly
          size={commonSize}
        >
          <PencilIcon className="stroke-default-600" />
        </Button>
      </FTooltip>
    </div>
  );
}

'use client';

import React, { JSX } from 'react';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import settingsStore from '@/app/stores/settingsStore';
import { Button } from '@heroui/button';
import { LinkIcon, PencilIcon } from 'lucide-react';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';

export interface GraphToolbarProps {
  isOpen: boolean;
  tools?: JSX.Element;
  onToggleEdit?: () => void;
  onCopyNodeLink?: () => void;
}

export default function GraphTooltipToolbar({
  isOpen,
  onToggleEdit,
  onCopyNodeLink,
  tools,
}: GraphToolbarProps) {
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
          data-testid="copy-link-btn"
          onPress={onCopyNodeLink}
          variant="light"
          color="default"
          isIconOnly
          size={commonSize}
        >
          <LinkIcon className="stroke-default-600" />
        </Button>
      </FTooltip>
      <FTooltip content={settingsStore.t.toolTips.tools.toggleEdit}>
        <Button
          data-testid="toggle-edit-mode-btn"
          onPress={onToggleEdit}
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

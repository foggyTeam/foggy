'use client';

import React, { JSX } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={clsx(
            'absolute -top-14 right-0 z-30 w-fit p-1 sm:z-50',
            bg_container_no_padding,
            'flex justify-center gap-1 overflow-visible',
          )}
          data-testid="board-tooltip-toolbar"
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{
            duration: 0.05,
            ease: 'easeInOut',
          }}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}

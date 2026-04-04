'use client';

import { observer } from 'mobx-react-lite';
import settingsStore from '@/app/stores/settingsStore';
import { Button } from '@heroui/button';
import { LockIcon, UnlockIcon } from 'lucide-react';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import React from 'react';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';

const LockGraphButton = observer(() => {
  const { isGraphLocked, lockGraph } = useGraphBoardContext();
  return (
    <FTooltip
      content={
        isGraphLocked
          ? settingsStore.t.toolTips.unlockGraph
          : settingsStore.t.toolTips.lockGraph
      }
    >
      <Button
        data-testid="lock-graph-btn"
        onPress={() => lockGraph(!isGraphLocked)}
        isIconOnly
        color="secondary"
        variant="light"
        size="md"
        className="invisible absolute right-[136px] bottom-4 z-50 font-semibold sm:visible"
      >
        {isGraphLocked ? <LockIcon /> : <UnlockIcon />}
      </Button>
    </FTooltip>
  );
});

export default LockGraphButton;

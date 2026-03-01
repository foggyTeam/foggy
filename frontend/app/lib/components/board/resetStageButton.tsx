'use client';

import { observer } from 'mobx-react-lite';
import settingsStore from '@/app/stores/settingsStore';
import { Button } from '@heroui/button';
import { MaximizeIcon } from 'lucide-react';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import React from 'react';

const ResetStageButton = observer(({ callback }: { callback?: () => void }) => {
  return (
    <FTooltip content={settingsStore.t.toolTips.resetStage}>
      <Button
        data-testid="reset-stage-btn"
        onPress={callback}
        isIconOnly
        color="secondary"
        variant="light"
        size="md"
        className="invisible absolute right-24 bottom-4 z-50 font-semibold sm:visible"
      >
        <MaximizeIcon />
      </Button>
    </FTooltip>
  );
});

export default ResetStageButton;

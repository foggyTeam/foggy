'use client';

import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import settingsStore from '@/app/stores/settingsStore';
import { Button } from '@heroui/button';
import { SquareArrowUpRightIcon } from 'lucide-react';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';

export default function ExternalLinkTool() {
  const { commonSize } = useAdaptiveParams();
  const { toolsDisabled, activeTool, setActiveTool, allToolsDisabled } =
    useGraphBoardContext();
  return (
    <FTooltip content={settingsStore.t.toolTips.tools.externalLinkTool}>
      <Button
        data-testid="external-link-tool-btn"
        isDisabled={toolsDisabled || allToolsDisabled}
        onPress={() => {
          if (activeTool === 'external-link') setActiveTool(undefined);
          else setActiveTool('external-link');
        }}
        variant={activeTool === 'external-link' ? 'flat' : 'light'}
        color={activeTool === 'external-link' ? 'primary' : 'default'}
        isIconOnly
        size={commonSize}
      >
        <SquareArrowUpRightIcon
          className={
            activeTool === 'external-link'
              ? 'stroke-primary-500'
              : 'stroke-default-600'
          }
        />
      </Button>
    </FTooltip>
  );
}

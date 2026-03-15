'use client';

import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import settingsStore from '@/app/stores/settingsStore';
import { Button } from '@heroui/button';
import { CircleIcon, ShapesIcon } from 'lucide-react';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { useBoardContext } from '@/app/lib/components/board/simple/boardContext';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';

export default function CustomNodeTool() {
  const { commonSize } = useAdaptiveParams();
  const {
    toolsDisabled,
    activeTool,
    setActiveTool,
    addElement,
    allToolsDisabled,
  } = useGraphBoardContext();

  return (
    <FTooltip content={settingsStore.t.toolTips.tools.customNodeTool}>
      <Button
        data-testid="custom-node-tool-btn"
        isDisabled={toolsDisabled || allToolsDisabled}
        onPress={() => {
          if (activeTool === 'custom-node') setActiveTool(undefined);
          else setActiveTool('custom-node');
        }}
        variant={activeTool === 'custom-node' ? 'flat' : 'light'}
        color={activeTool === 'custom-node' ? 'primary' : 'default'}
        isIconOnly
        size={commonSize}
      >
        <ShapesIcon
          className={
            activeTool === 'custom-node'
              ? 'stroke-primary-500'
              : 'stroke-default-600'
          }
        />
      </Button>
    </FTooltip>
  );
}

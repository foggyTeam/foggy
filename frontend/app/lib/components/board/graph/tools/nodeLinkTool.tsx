'use client';

import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import settingsStore from '@/app/stores/settingsStore';
import { Button } from '@heroui/button';
import { WorkflowIcon } from 'lucide-react';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';

export default function NodeLinkTool() {
  const { commonSize } = useAdaptiveParams();
  const { toolsDisabled, activeTool, setActiveTool, allToolsDisabled } =
    useGraphBoardContext();
  return (
    <FTooltip content={settingsStore.t.toolTips.tools.nodeLinkTool}>
      <Button
        data-testid="node-link-tool-btn"
        isDisabled={toolsDisabled || allToolsDisabled}
        onPress={() => {
          if (activeTool === 'node-link') setActiveTool(undefined);
          else setActiveTool('node-link');
        }}
        variant={activeTool === 'node-link' ? 'flat' : 'light'}
        color={activeTool === 'node-link' ? 'primary' : 'default'}
        isIconOnly
        size={commonSize}
      >
        <WorkflowIcon
          className={
            activeTool === 'node-link'
              ? 'stroke-primary-500'
              : 'stroke-default-600'
          }
        />
      </Button>
    </FTooltip>
  );
}

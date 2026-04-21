'use client';

import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import settingsStore from '@/app/stores/settingsStore';
import { Button } from '@heroui/button';
import { FolderTreeIcon } from 'lucide-react';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';

export default function InternalLinkTool() {
  const { commonSize } = useAdaptiveParams();
  const { toolsDisabled, activeTool, setActiveTool, allToolsDisabled } =
    useGraphBoardContext();
  return (
    <FTooltip content={settingsStore.t.toolTips.tools.internalLinkTool}>
      <Button
        data-testid="internal-link-tool-btn"
        isDisabled={toolsDisabled || allToolsDisabled}
        onPress={() => {
          if (activeTool === 'internal-link') setActiveTool(undefined);
          else setActiveTool('internal-link');
        }}
        variant={activeTool === 'internal-link' ? 'flat' : 'light'}
        color={activeTool === 'internal-link' ? 'primary' : 'default'}
        isIconOnly
        size={commonSize}
      >
        <FolderTreeIcon
          className={
            activeTool === 'internal-link'
              ? 'stroke-primary-500'
              : 'stroke-default-600'
          }
        />
      </Button>
    </FTooltip>
  );
}

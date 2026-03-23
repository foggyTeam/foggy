'use client';

import { Button } from '@heroui/button';
import { GanttChartIcon } from 'lucide-react';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import { GEdge } from '@/app/lib/types/definitions';

const DASH = '6 3';

export default function LineStyleTool({
  edge,
  onChange,
}: {
  edge: GEdge;
  onChange: (patch: Partial<Pick<GEdge, 'style'>>) => void;
}) {
  const { commonSize } = useAdaptiveParams();
  const { allToolsDisabled } = useGraphBoardContext();

  const isDashed = edge.style?.strokeDasharray === DASH;

  const toggle = () =>
    onChange({
      style: {
        ...edge.style,
        strokeDasharray: isDashed ? undefined : DASH,
      },
    });

  return (
    <Button
      data-testid="edge-dash-tool-btn"
      isDisabled={allToolsDisabled}
      onPress={toggle}
      variant={isDashed ? 'flat' : 'light'}
      color={isDashed ? 'primary' : 'default'}
      isIconOnly
      size={commonSize}
    >
      <FTooltip content={settingsStore.t.toolTips.tools.edgeDash}>
        <GanttChartIcon
          className={isDashed ? 'stroke-primary' : 'stroke-default-600'}
        />
      </FTooltip>
    </Button>
  );
}

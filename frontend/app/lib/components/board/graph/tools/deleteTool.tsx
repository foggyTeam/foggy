'use client';

import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import settingsStore from '@/app/stores/settingsStore';
import { TrashIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';

export default function DeleteTool() {
  const { commonSize } = useAdaptiveParams();

  const { deleteSelectedElements, allToolsDisabled } = useGraphBoardContext();
  return (
    <Button
      data-testid="delete-tool-btn"
      onPress={deleteSelectedElements}
      isDisabled={allToolsDisabled}
      variant="light"
      color="danger"
      isIconOnly
      size={commonSize}
    >
      <FTooltip content={settingsStore.t.toolTips.tools.deleteTool}>
        <TrashIcon className="stroke-danger-500" />
      </FTooltip>
    </Button>
  );
}

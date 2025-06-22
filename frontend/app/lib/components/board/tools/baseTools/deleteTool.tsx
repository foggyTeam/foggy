import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import settingsStore from '@/app/stores/settingsStore';
import { TrashIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { useBoardContext } from '@/app/lib/components/board/boardContext';

export default function DeleteTool() {
  const { selectedElement, removeElement, allToolsDisabled } =
    useBoardContext();
  return (
    <Button
      onPress={() => removeElement(selectedElement.attrs.id)}
      isDisabled={allToolsDisabled}
      variant="light"
      color="danger"
      isIconOnly
      size="md"
    >
      <FTooltip content={settingsStore.t.toolTips.tools.deleteTool}>
        <TrashIcon className="stroke-danger-500" />
      </FTooltip>
    </Button>
  );
}

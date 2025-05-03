import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import settingsStore from '@/app/stores/settingsStore';
import { TrashIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { ElementToolProps } from '@/app/lib/components/board/menu/elementToolBar';

export default function DeleteTool({
  element,
  removeElement,
}: ElementToolProps) {
  return (
    <Button
      onPress={() => removeElement(element.attrs.id)}
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

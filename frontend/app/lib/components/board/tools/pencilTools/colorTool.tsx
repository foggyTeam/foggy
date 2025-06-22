import { CircleIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { to_rgb } from '@/tailwind.config';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import ColorPicker from '@/app/lib/components/board/tools/colorPicker';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import { useBoardContext } from '@/app/lib/components/board/boardContext';

export default function ColorTool({
  color,
  setColor,
}: {
  color: string;
  setColor: (newColor: string) => void;
}) {
  const { allToolsDisabled } = useBoardContext();

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          isDisabled={allToolsDisabled}
          variant="light"
          color="default"
          isIconOnly
          size="md"
        >
          <FTooltip content={settingsStore.t.toolTips.tools.pencilColor}>
            <CircleIcon fill={color} stroke={`rgba(${to_rgb(color)}, .48)`} />
          </FTooltip>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={clsx(
          bg_container_no_padding,
          'flex w-fit flex-col gap-2 px-1 py-2 sm:px-1 sm:py-3',
        )}
      >
        <ColorPicker value={color} changeValue={setColor} />
      </PopoverContent>
    </Popover>
  );
}

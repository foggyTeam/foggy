import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import { Button } from '@heroui/button';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import settingsStore from '@/app/stores/settingsStore';
import { AudioWaveformIcon, DotIcon } from 'lucide-react';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import { Slider } from '@heroui/slider';

export default function SliderTool({
  type,
  value,
  setValue,
}: {
  type: 'width' | 'tension';
  value: number;
  setValue: (newValue: number) => void;
}) {
  const boundary = {
    width: { min: 1, max: 20, step: 0.5 },
    tension: { min: 0, max: 8, step: 0.5 },
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="light" color="default" isIconOnly size="md">
          {type === 'width' ? (
            <FTooltip content={settingsStore.t.toolTips.tools.pencilWidth}>
              <DotIcon
                strokeWidth={value - boundary.width.min}
                className="fill-default-500 stroke-default-500"
              />
            </FTooltip>
          ) : (
            <FTooltip content={settingsStore.t.toolTips.tools.pencilTension}>
              <AudioWaveformIcon className="stroke-default-500" />
            </FTooltip>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={clsx(
          bg_container_no_padding,
          'flex w-fit flex-col gap-2 px-1 py-2 sm:px-1 sm:py-3',
        )}
      >
        <Slider
          value={value}
          onChange={(value: number | number[]) =>
            setValue(Array.isArray(value) ? value[0] : value)
          }
          maxValue={boundary[type].max}
          minValue={boundary[type].min}
          step={boundary[type].step}
          className="h-24"
          size="md"
          orientation="vertical"
          showOutline
          showTooltip
          aria-label={type}
        />
      </PopoverContent>
    </Popover>
  );
}

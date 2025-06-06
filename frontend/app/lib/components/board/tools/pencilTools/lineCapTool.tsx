import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import { Button } from '@heroui/button';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import settingsStore from '@/app/stores/settingsStore';
import { CircleIcon, ScissorsLineDashedIcon, SquareIcon } from 'lucide-react';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import { Listbox, ListboxItem } from '@heroui/listbox';
import { ReactNode } from 'react';

export default function LineCapTool({
  value,
  setValue,
}: {
  value: 'butt' | 'round' | 'square';
  setValue: (newValue: 'butt' | 'round' | 'square') => void;
}) {
  const options = {
    round: {
      icon: CircleIcon,
      label: settingsStore.t.toolTips.tools.lineCapRound,
    },
    square: {
      icon: SquareIcon,
      label: settingsStore.t.toolTips.tools.lineCapSquare,
    },
    butt: {
      icon: ScissorsLineDashedIcon,
      label: settingsStore.t.toolTips.tools.lineCapButt,
    },
  };

  const getIcon = (value: keyof typeof options): ReactNode => {
    const Icon = options[value].icon;
    return (
      <Icon
        className={clsx(
          'h-4 w-4 fill-default-500 stroke-default-500',
          value !== 'butt' && 'scale-x-75',
        )}
      />
    ) as ReactNode;
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="light" color="default" isIconOnly size="md">
          <FTooltip content={settingsStore.t.toolTips.tools.pencilCap}>
            {getIcon(value)}
          </FTooltip>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={clsx(
          bg_container_no_padding,
          'flex w-fit flex-col gap-2 px-1 py-2 sm:px-1 sm:py-3',
        )}
      >
        <Listbox
          className="w-fit"
          selectedKeys={[value]}
          onSelectionChange={(keys: any) =>
            setValue((Array.from(keys) as (keyof typeof options)[])[0])
          }
          selectionMode="single"
          disallowEmptySelection
          label="linecap"
        >
          {
            Object.entries(options).map(([key, option]) => (
              <ListboxItem
                key={key}
                startContent={getIcon(key as keyof typeof options)}
                title={option.label}
              />
            )) as any
          }
        </Listbox>
      </PopoverContent>
    </Popover>
  );
}

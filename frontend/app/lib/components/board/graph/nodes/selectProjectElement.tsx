'use client';

import React, { useState } from 'react';
import { Input } from '@heroui/input';
import settingsStore from '@/app/stores/settingsStore';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { GInternalLinkNode } from '@/app/lib/types/definitions';
import ElementIcon from '@/app/lib/components/menu/leftSideBar/elementIcon';
import { ChevronRightIcon, GlobeIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';

type ElementType = GInternalLinkNode['data']['element'] | undefined;
export default function SelectProjectElement({
  value,
  onValueChange,
}: {
  value: ElementType;
  onValueChange: (newValue: ElementType) => void;
}) {
  const { smallerSize } = useAdaptiveParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selected, setSelected] = useState();

  return (
    <Popover
      placement="bottom"
      isOpen={isMenuOpen}
      onOpenChange={(open) => setIsMenuOpen(open)}
    >
      <PopoverTrigger>
        <div className="w-full">
          <Input
            value={value?.title}
            startContent={
              value?.type ? (
                <ElementIcon
                  className="h-5 w-5 shrink-0"
                  elementType={value.type}
                />
              ) : (
                <GlobeIcon className="text-f_accent-500 h-5 w-5 shrink-0" />
              )
            }
            endContent={
              <ChevronRightIcon
                className={clsx(
                  'stroke-default-600 transition-transform',
                  isMenuOpen && 'rotate-90',
                )}
              />
            }
            isReadOnly
            radius="full"
            size={smallerSize}
            variant="flat"
            type="text"
            className="w-full"
            classNames={{
              base: 'sm:text-small text-medium',
            }}
            placeholder={settingsStore.t.toolBar.selectElementPlaceholder}
            aria-label="select-project-item"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className={clsx(
          bg_container_no_padding,
          'flex w-fit flex-col gap-2 px-1 py-2 sm:px-1 sm:py-3',
        )}
      >
        <div className="px-1 py-2">
          <div className="text-small font-bold">Popover Content</div>
          <div className="text-tiny">This is the popover content</div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

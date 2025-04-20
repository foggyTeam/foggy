import clsx from 'clsx';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { ChevronRightIcon } from 'lucide-react';
import React from 'react';

export default function RootSectionCardOverlay({ name }: { name: string }) {
  return (
    <div
      className={clsx(
        'box-border flex max-h-16 w-full flex-col items-start justify-start',
        'rounded-2xl border-1 border-f_accent bg-white px-3 py-2 shadow-container',
      )}
    >
      <div className="flex h-12 w-full items-center justify-start gap-1">
        <Button isIconOnly variant="light" size="sm">
          <ChevronRightIcon className="stroke-default-500" />
        </Button>
        <Input
          isReadOnly={true}
          value={name.toUpperCase()}
          variant="bordered"
          size="sm"
          classNames={{
            inputWrapper: 'border-none shadow-none max-w-sm',
            input: 'truncate text-nowrap',
          }}
        />
      </div>
    </div>
  );
}

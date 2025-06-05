import { Avatar } from '@heroui/avatar';
import React from 'react';
import { Button } from '@heroui/button';
import { MoveDiagonalIcon } from 'lucide-react';
import clsx from 'clsx';

export default function RequestMessageCard({
  nickname,
  avatar,
  message,
  onExpand,
}: {
  nickname: string;
  avatar?: string;
  message?: string;
  onExpand?: () => void;
}) {
  return (
    <div className="flex w-full flex-col gap-1 rounded-small bg-default-200 p-2">
      <div className="flex w-full flex-nowrap items-center justify-between gap-2">
        <div className="flex w-full items-center justify-start gap-1">
          <Avatar
            classNames={{
              base: clsx(onExpand && 'h-7 w-7', 'border-default-200 border-2'),
            }}
            color="primary"
            src={avatar}
            name={nickname}
          />
          <p
            className={clsx(
              'font-bold text-default-700',
              onExpand ? 'text-xs' : 'text-sm',
            )}
          >
            {nickname}
          </p>
        </div>
        {onExpand && (
          <Button
            isIconOnly
            onPress={onExpand}
            variant="light"
            radius="full"
            size="sm"
          >
            <MoveDiagonalIcon className="stroke-default-400 transition-colors hover:stroke-default-500" />
          </Button>
        )}
      </div>
      <div className="w-full">
        <p
          className={clsx(
            'w-full pr-0.5 text-start',
            onExpand ? 'line-clamp-1 text-xs' : 'line-clamp-none text-sm',
          )}
        >
          {message}
        </p>
      </div>
    </div>
  );
}

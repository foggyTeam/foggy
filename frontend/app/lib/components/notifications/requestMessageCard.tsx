import { Avatar } from '@heroui/avatar';
import React from 'react';
import { Button } from '@heroui/button';
import { MoveDiagonalIcon } from 'lucide-react';
import clsx from 'clsx';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

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
  const { smallerSize } = useAdaptiveParams();

  return (
    <div className="rounded-small bg-default-200 flex w-full flex-col gap-1 p-2">
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
              'text-default-700 font-bold',
              onExpand ? 'text-xs' : 'text-medium sm:text-sm',
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
            size={smallerSize}
          >
            <MoveDiagonalIcon className="stroke-default-400 hover:stroke-default-600 transition-colors" />
          </Button>
        )}
      </div>
      <div className="w-full">
        <p
          className={clsx(
            'w-full pr-0.5 text-start',
            onExpand
              ? 'line-clamp-1 text-xs'
              : 'text-medium line-clamp-none sm:text-sm',
          )}
        >
          {message}
        </p>
      </div>
    </div>
  );
}

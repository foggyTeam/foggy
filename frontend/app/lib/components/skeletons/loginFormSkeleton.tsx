import React, { FC, JSX } from 'react';
import { Skeleton } from '@heroui/skeleton';
import { Input } from '@heroui/input';

const LoginFormSkeleton: FC = (): JSX.Element => {
  return (
    <div className={'flex min-w-24 flex-col gap-2 sm:w-80'}>
      <Skeleton className="rounded-lg">
        <Input size="md"></Input>
      </Skeleton>
      <Skeleton className="rounded-lg">
        <Input size="md"></Input>
      </Skeleton>

      <div className="flex justify-between">
        <Skeleton className="rounded-lg">sign in</Skeleton>
        <Skeleton className="rounded-lg">log in</Skeleton>
      </div>

      <Skeleton className="rounded-lg">Login with Google / Yandex</Skeleton>
    </div>
  );
};

export default LoginFormSkeleton;

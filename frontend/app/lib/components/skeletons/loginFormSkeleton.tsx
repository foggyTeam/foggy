import React, { FC, JSX } from 'react';
import { Skeleton } from "@heroui/skeleton";
import { Input } from "@heroui/input";

const LoginFormSkeleton: FC = (): JSX.Element => {
  return (
    <div className={'flex min-w-24 flex-col gap-2 sm:w-80'}>
      <Skeleton>
        <Input size="md"></Input>
      </Skeleton>
      <Skeleton>
        <Input size="md"></Input>
      </Skeleton>

      <div className={'flex justify-between'}>
        <Skeleton> sign in</Skeleton>
        <Skeleton>log in</Skeleton>
      </div>

      <Skeleton>Login with Google / Yandex</Skeleton>
    </div>
  );
};

export default LoginFormSkeleton;

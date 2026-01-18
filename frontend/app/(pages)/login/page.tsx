'use server';
import React, { Suspense } from 'react';
import LoginForm from '@/app/lib/components/loginForm';
import LoginFormSkeleton from '@/app/lib/components/skeletons/loginFormSkeleton';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import FoggyLarge from '@/app/lib/components/svg/foggyLarge';
import FoggySmall from '@/app/lib/components/svg/foggySmall';

const LoginPage = () => {
  return (
    <>
      <div className="flex h-full w-full items-center justify-center p-4">
        <div
          className={clsx(
            'flex h-fit w-full px-4 transition-transform sm:w-fit sm:px-16',
            bg_container_no_padding,
          )}
        >
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4">
            <FoggyLarge
              className="fill-primary hidden max-h-96 w-full sm:flex sm:max-w-80"
              alt={'foggy logo'}
            />
            <FoggySmall
              className="fill-primary h-full max-h-60 sm:hidden"
              alt={'foggy logo'}
            />

            <Suspense fallback={<LoginFormSkeleton />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
      <p className="text-secondary-500 text-medium absolute bottom-4 left-4 z-50 flex h-10 items-center gap-1 sm:text-sm">
        Icons by
        <a href="https://icons8.com" className="hover:underline">
          Icons8
        </a>
      </p>
    </>
  );
};

export default LoginPage;

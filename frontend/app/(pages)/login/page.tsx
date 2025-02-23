'use server';
import React, { Suspense } from 'react';
import LoginForm from '@/app/lib/components/loginForm';
import Image from 'next/image';
import bg from '@/public/images/1.webp';
import LoginFormSkeleton from '@/app/lib/components/skeletons/loginFormSkeleton';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import FoggyLarge from '@/app/lib/components/svg/foggyLarge';

const Login = () => {
  return (
    <>
      <div className="flex h-screen w-screen items-center justify-center">
        <div
          className={clsx(
            'flex h-[560] w-4/5 max-w-[1040px] sm:w-3/4',
            bg_container_no_padding,
          )}
        >
          <div
            className={
              'hidden h-auto w-[420] items-center justify-center md:flex'
            }
          >
            <Image
              className={'h-full w-full object-cover'}
              alt={'bg-picture'}
              priority
              src={bg}
            ></Image>
          </div>

          <div
            className={
              'flex h-full w-full flex-col items-center justify-center gap-2 p-4'
            }
          >
            <FoggyLarge width={320} height={240} alt={'foggy logo'} />

            <Suspense fallback={<LoginFormSkeleton />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
      <p className="absolute bottom-4 left-4 z-50 flex h-10 items-center gap-1 text-sm text-secondary-500">
        Icons by
        <a href="https://icons8.com" className="hover:underline">
          Icons8
        </a>
      </p>
    </>
  );
};

export default Login;

'use server';
import React, { Suspense } from 'react';
import LoginForm from '@/app/lib/components/loginForm';
import Image from 'next/image';
import bg from '@/public/images/1.webp';
import foggy from '@/public/foggy.svg';
import { Skeleton } from '@nextui-org/skeleton';
import loginFormSkeleton from '@/app/lib/components/skeletons/loginFormSkeleton';
import LoginFormSkeleton from '@/app/lib/components/skeletons/loginFormSkeleton';

const Login = () => {
  return (
    <div className={'flex h-screen w-screen items-center justify-center'}>
      <div
        className={
          'flex h-[560] w-4/5 max-w-[1040px] overflow-clip rounded-2xl border-1 border-white border-opacity-10 bg-white bg-opacity-50 backdrop-blur-3xl sm:w-3/4'
        }
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
          <Image className={'h-64 w-64'} alt={'foggy logo'} src={foggy}></Image>

          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Login;

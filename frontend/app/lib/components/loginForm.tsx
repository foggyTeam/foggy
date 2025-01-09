'use client';

import { FC, JSX, memo } from 'react';
import Image from 'next/image';
import foggy from '../../../public/foggy.svg';
import bg from '../../../public//images/1.webp';
import Form from 'next/form';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';

const LoginForm: FC = (): JSX.Element => {
  return (
    <div
      className={
        'flex h-[560] w-4/5 max-w-[1040px] overflow-clip rounded-2xl border-1 border-white border-opacity-10 bg-white bg-opacity-50 backdrop-blur-3xl sm:w-3/4'
      }
    >
      <div
        className={'hidden h-auto w-[420] items-center justify-center md:flex'}
      >
        <Image
          className={'h-full w-full object-cover'}
          alt={'bg-picture'}
          src={bg}
        ></Image>
      </div>

      <div
        className={
          'flex h-full w-full flex-col items-center justify-center gap-2 p-4'
        }
      >
        <Image className={'h-64 w-64'} alt={'foggy logo'} src={foggy}></Image>

        <Form
          className={'flex min-w-24 flex-col gap-2 sm:w-80'}
          action={(data) => console.log(`log in ${data.get('email')}`)}
        >
          <Input
            isRequired
            isClearable
            errorMessage="Please enter a valid email"
            label="Email"
            labelPlacement="inside"
            name="email"
            type="email"
            size="md"
          />

          <Input
            isRequired
            isClearable
            errorMessage="Please enter a valid password"
            label="Password"
            labelPlacement="inside"
            name="password"
            type="password"
            size="md"
          />

          <div className={'flex justify-between'}>
            <Button
              onPress={() => console.log('sign in')}
              variant="light"
              color="primary"
              size="md"
            >
              sign in
            </Button>
            <Button variant="solid" color="primary" type="submit" size="md">
              log in
            </Button>
          </div>

          <Button
            onPress={() => console.log('sign in via Google / Yandex')}
            variant="bordered"
            size="md"
            className={'w-fit border-none px-0'}
          >
            Login with Google / Yandex
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default memo(LoginForm);

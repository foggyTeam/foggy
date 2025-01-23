'use client';

import React, { useState } from 'react';
import { Form } from '@heroui/form';
import { Input } from '@heroui/input';
import { Eye, EyeClosed, X } from 'lucide-react';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { signUserIn } from '@/app/lib/server/actions/signUserIn';
import { signUserViaProviders } from '@/app/lib/server/actions/signUserViaProviders';
import { AvailableProviders } from '@/app/lib/utils/definitions';
import { loginFormSchema } from '@/app/lib/utils/schemas';
import z from 'zod';

enum ButtonAction {
  UNDEFINED,
  LOGIN,
  SIGNIN,
}

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({} as any);
  const [action, setAction] = useState(ButtonAction.UNDEFINED);
  const [loginButtonLoading, setLoginButtonLoading] = useState(false);
  const [signinButtonLoading, setSigninButtonLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  function isFormValid(data: { email: string; password: string }) {
    try {
      loginFormSchema.parse(data);
      setErrors({});
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        const newErrors: any = {};
        e.errors.forEach((error) => {
          if (error.path.length > 0) {
            newErrors[error.path[0]] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(e.currentTarget)) as {
      email: string;
      password: string;
    };

    if (!isFormValid(data)) return;

    try {
      if (action === ButtonAction.SIGNIN) {
        setSigninButtonLoading(true);

        await signUserIn(
          {
            email: data.email,
            password: data.password,
          },
          true,
        ).finally(() => {
          setSigninButtonLoading(false);
        });
      } else if (action === ButtonAction.LOGIN) {
        setLoginButtonLoading(true);

        await signUserIn({
          email: data.email,
          password: data.password,
        }).finally(() => {
          setLoginButtonLoading(false);
        });
      } else return;

      setAction(ButtonAction.UNDEFINED);
    } catch (e) {
      console.log(e.message);
      e.message
        ? setErrors({ email: e.message.split('.')[0] })
        : setErrors({
            email: 'Invalid credentials',
            password: 'Invalid credentials',
          });
      return;
    }

    setErrors({});

    await router.push('/');
  };

  return (
    <Form
      className={'flex min-w-24 flex-col gap-2 sm:w-80'}
      onSubmit={onSubmit}
      validationErrors={errors}
    >
      <Input
        isRequired
        errorMessage={errors.email}
        label="Email"
        labelPlacement="inside"
        placeholder="hoggyfoggy@example.com"
        name="email"
        type="email"
        autocomplete="email"
        size="md"
        value={email}
        onValueChange={setEmail}
        endContent={
          email && (
            <button
              aria-label="clear field"
              className="h-fit w-fit"
              type="button"
              onClick={() => setEmail('')}
            >
              <X className="stroke-default-400" />
            </button>
          )
        }
      />

      <Input
        isRequired
        errorMessage={errors.password}
        label="Password"
        labelPlacement="inside"
        placeholder="qwerty123"
        name="password"
        value={password}
        onValueChange={setPassword}
        type={passwordVisible ? 'text' : 'password'}
        endContent={
          <div className="flex items-center gap-2">
            <button
              aria-label="clear field"
              className="h-fit w-fit"
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? (
                <Eye className="stroke-default-400" />
              ) : (
                <EyeClosed className="stroke-default-400" />
              )}
            </button>
            {password && (
              <button
                aria-label="clear field"
                className="h-fit w-fit"
                type="button"
                onClick={() => setPassword('')}
              >
                <X className="stroke-default-400" />
              </button>
            )}
          </div>
        }
        size="md"
        autocomplete="current-password"
      />

      <div className={'flex w-full justify-between'}>
        <FButton
          onPress={() => setAction(ButtonAction.SIGNIN)}
          type={action === ButtonAction.SIGNIN ? 'submit' : 'button'}
          isLoading={signinButtonLoading}
          variant="light"
          color="primary"
          size="md"
        >
          sign up
        </FButton>

        <FButton
          onPress={() => setAction(ButtonAction.LOGIN)}
          isLoading={loginButtonLoading}
          type="submit"
          variant="solid"
          color="primary"
          size="md"
        >
          log in
        </FButton>
      </div>

      <p className="text-small">
        Login with
        <Button
          onPress={() => signUserViaProviders(AvailableProviders.GOOGLE)}
          variant="bordered"
          size="md"
          className={'border-none px-0'}
        >
          Google
        </Button>
        /
        <Button
          onPress={() => signUserViaProviders(AvailableProviders.YANDEX)}
          variant="bordered"
          size="md"
          className={'border-none px-0'}
        >
          Yandex
        </Button>
      </p>
    </Form>
  );
}

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
import { AvailableProviders } from '@/app/lib/types/definitions';
import { loginFormSchema } from '@/app/lib/types/schemas';
import z from 'zod';
import { observer } from 'mobx-react-lite';
import settingsStore from '../../stores/settingsStore';
import GoogleIcon from '@/app/lib/components/svg/GoogleIcon';
import YandexIcon from '@/app/lib/components/svg/YandexIcon';
import { primary } from '@/tailwind.config';

enum ButtonAction {
  UNDEFINED,
  LOGIN,
  SIGNIN,
}

const LoginForm = observer(() => {
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

  const onSubmit = async (formData: any) => {
    formData.preventDefault();

    const data = Object.fromEntries(new FormData(formData.currentTarget)) as {
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
    } catch (e: any) {
      if (e.message) setErrors({ email: e.message.split('.')[0] });
      else
        setErrors({
          email: settingsStore.t.errors.invalidCredentials,
          password: settingsStore.t.errors.invalidCredentials,
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
      validationErrors={errors as any}
    >
      <Input
        isRequired
        errorMessage={errors.email}
        label={settingsStore.t.login.email}
        labelPlacement="inside"
        placeholder={settingsStore.t.login.emailPlaceholder}
        name="email"
        type="email"
        autoComplete="email"
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
        label={settingsStore.t.login.password}
        labelPlacement="inside"
        placeholder={settingsStore.t.login.passwordPlaceholder}
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
                <Eye className="stroke-default-500" />
              ) : (
                <EyeClosed className="stroke-default-500" />
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
        autoComplete="current-password"
      />

      <div className="mt-1 flex w-full items-center justify-between gap-2">
        <FButton
          onPress={() => setAction(ButtonAction.SIGNIN)}
          type={action === ButtonAction.SIGNIN ? 'submit' : 'button'}
          isLoading={signinButtonLoading}
          variant="bordered"
          color="primary"
          size="md"
          className="w-full"
        >
          {settingsStore.t.login.signUpButton}
        </FButton>

        <FButton
          onPress={() => setAction(ButtonAction.LOGIN)}
          isLoading={loginButtonLoading}
          type="submit"
          variant="solid"
          color="primary"
          size="md"
        >
          {settingsStore.t.login.signInButton}
        </FButton>
      </div>

      <div className="mt-1 flex w-full items-center justify-center gap-3">
        <Button
          onPress={() => signUserViaProviders(AvailableProviders.GOOGLE)}
          isIconOnly
          variant="light"
          color="secondary"
          size="md"
        >
          <GoogleIcon
            alt="Google"
            width="32"
            height="32"
            stroke={primary.DEFAULT}
          />
        </Button>

        <Button
          onPress={() => signUserViaProviders(AvailableProviders.YANDEX)}
          isIconOnly
          variant="light"
          color="secondary"
          size="md"
        >
          <YandexIcon
            alt="Yandex"
            width="32"
            height="32"
            stroke={primary.DEFAULT}
          />
        </Button>
      </div>
    </Form>
  );
});

export default LoginForm;

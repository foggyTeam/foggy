'use client';

import React, { useEffect, useState } from 'react';
import { Form } from '@heroui/form';
import { Input } from '@heroui/input';
import { Eye, EyeClosed, X } from 'lucide-react';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { AvailableProviders } from '@/app/lib/types/definitions';
import { loginFormSchema } from '@/app/lib/types/schemas';
import { observer } from 'mobx-react-lite';
import settingsStore from '../../stores/settingsStore';
import GoogleIcon from '@/app/lib/components/svg/GoogleIcon';
import YandexIcon from '@/app/lib/components/svg/YandexIcon';
import { primary } from '@/tailwind.config';
import {
  SignUserIn,
  SignUserViaProviders,
} from '@/app/lib/server/actions/userServerActions';
import IsFormValid from '@/app/lib/utils/isFormValid';
import { useTheme } from 'next-themes';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

enum ButtonAction {
  UNDEFINED,
  LOGIN,
  SIGNIN,
}

const LoginForm = observer(() => {
  const { commonSize } = useAdaptiveParams();
  const { resolvedTheme } = useTheme();
  const theme = (resolvedTheme as 'light' | 'dark') ?? 'light';

  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [action, setAction] = useState(ButtonAction.UNDEFINED);
  const [loginButtonLoading, setLoginButtonLoading] = useState(false);
  const [signInButtonLoading, setSignInButtonLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (email || password)
      IsFormValid({ email, password }, loginFormSchema, setErrors);
  }, [password, email]);

  const onSubmit = async (formData: any) => {
    formData.preventDefault();

    const data = Object.fromEntries(new FormData(formData.currentTarget)) as {
      email: string;
      password: string;
    };

    if (Object.keys(errors).length) return;

    try {
      if (action === ButtonAction.SIGNIN) {
        setSignInButtonLoading(true);

        await SignUserIn(
          {
            email: data.email,
            password: data.password,
          },
          true,
        ).finally(() => {
          setSignInButtonLoading(false);
        });
      } else if (action === ButtonAction.LOGIN) {
        setLoginButtonLoading(true);

        await SignUserIn({
          email: data.email,
          password: data.password,
        }).finally(() => {
          setLoginButtonLoading(false);
        });
      } else return;

      setAction(ButtonAction.UNDEFINED);
    } catch (e: any) {
      if (e.message) setErrors(JSON.parse(e.message.split('.')[0]));
      else
        setErrors({
          email: settingsStore.t.errors.invalidCredentials,
          password: settingsStore.t.errors.invalidCredentials,
        });
      return;
    }

    await router.push('/');
  };

  return (
    <Form
      className="flex w-full min-w-24 flex-col gap-2 sm:w-80"
      onSubmit={onSubmit}
      validationErrors={errors}
    >
      <Input
        isRequired
        autoFocus
        isInvalid={errors.email}
        errorMessage={errors.email}
        label={settingsStore.t.login.email}
        labelPlacement="inside"
        placeholder={settingsStore.t.login.emailPlaceholder}
        name="email"
        type="email"
        autoComplete="email"
        size={commonSize}
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
              <X className="stroke-default-600" />
            </button>
          )
        }
        classNames={{ inputWrapper: 'bg-[hsl(var(--heroui-background))]' }}
      />

      <Input
        isRequired
        isInvalid={errors.password}
        label={settingsStore.t.login.password}
        labelPlacement="inside"
        placeholder={settingsStore.t.login.passwordPlaceholder}
        name="password"
        errorMessage={errors.password}
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
                <Eye className="stroke-default-600" />
              ) : (
                <EyeClosed className="stroke-default-600" />
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
        size={commonSize}
        autoComplete="current-password"
        classNames={{ inputWrapper: 'bg-[hsl(var(--heroui-background))]' }}
      />

      <div className="mt-1 flex w-full flex-wrap items-center justify-between gap-2 sm:max-w-80 sm:flex-nowrap">
        <FButton
          onPress={() => setAction(ButtonAction.SIGNIN)}
          isDisabled={!!Object.keys(errors).length || loginButtonLoading}
          type={action === ButtonAction.SIGNIN ? 'submit' : 'button'}
          isLoading={signInButtonLoading}
          variant="ghost"
          color="primary"
          size={commonSize}
          className="w-full"
          data-testid="signin-btn"
        >
          {settingsStore.t.login.signUpButton}
        </FButton>

        <FButton
          onPress={() => setAction(ButtonAction.LOGIN)}
          isDisabled={!!Object.keys(errors).length || signInButtonLoading}
          isLoading={loginButtonLoading}
          type="submit"
          variant="solid"
          color="primary"
          size={commonSize}
          data-testid="login-btn"
          className="w-full sm:w-fit"
        >
          {settingsStore.t.login.signInButton}
        </FButton>
      </div>

      <div className="mt-1 flex w-full items-center justify-center gap-3">
        <Button
          onPress={() => SignUserViaProviders(AvailableProviders.GOOGLE)}
          isIconOnly
          variant="light"
          color="secondary"
          data-testid="google-btn"
          size={commonSize}
        >
          <GoogleIcon
            alt="Google"
            width="32"
            height="32"
            stroke={primary[theme].DEFAULT}
          />
        </Button>
        <Button
          data-testid="yandex-btn"
          onPress={() => SignUserViaProviders(AvailableProviders.YANDEX)}
          isIconOnly
          variant="light"
          color="secondary"
          size={commonSize}
        >
          <YandexIcon
            alt="Yandex"
            width="32"
            height="32"
            stroke={primary[theme].DEFAULT}
          />
        </Button>
      </div>
    </Form>
  );
});

export default LoginForm;

'use client';

import React, { useState } from 'react';
import { Form } from '@nextui-org/form';
import { Input } from '@nextui-org/input';
import { Eye, EyeClosed, X } from 'lucide-react';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';
import { useRouter } from 'next/navigation';
import { Button } from '@nextui-org/button';
import { signUserIn } from '@/app/lib/server/actions/signUserIn';

enum ButtonAction {
  UNDEFINED,
  LOGIN,
  SIGNIN,
}

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [action, setAction] = useState(ButtonAction.UNDEFINED);
  const [loginButtonLoading, setLoginButtonLoading] = useState(false);
  const [signinButtonLoading, setSigninButtonLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const getEmailError = (value: string): string | null => {
    if (!value) {
      return 'Email is required';
    }
    if (value.length > 100)
      return 'Email must be no more than 100 characters long';
    if (!value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/))
      return 'Email must be valid';

    return null;
  };

  const getPasswordError = (value): string | null => {
    if (value == '') return 'Password is required';

    if (value.length < 8) return 'Password must be at least 8 characters long';

    if (value.length > 20)
      return 'Password must be no more than 20 characters long';

    if (!value.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/))
      return 'Password must contain at least 1 letter and 1 number';

    return null;
  };

  function isFormValid(
    emailError: string | null,
    passwordError: string | null,
  ) {
    const newErrors: any = {};

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return false;
    }
    return true;
  }

  const onSubmit = async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (
      !isFormValid(getEmailError(data.email), getPasswordError(data.password))
    )
      return;

    if (action === ButtonAction.SIGNIN) {
      setSigninButtonLoading(true);

      try {
        await signUserIn(
          {
            nickname: 'user1',
            email: data.email,
            password: data.password,
          },
          true,
        ).finally(() => {
          setSigninButtonLoading(false);
          setAction(ButtonAction.UNDEFINED);
        });
      } catch (e) {
        !isFormValid(e.message, null);
        return;
      }
    } else if (action === ButtonAction.LOGIN) {
      setLoginButtonLoading(true);

      try {
        await signUserIn({
          email: data.email,
          password: data.password,
        }).finally(() => {
          setLoginButtonLoading(false);
          setAction(ButtonAction.UNDEFINED);
        });
      } catch (e) {
        !isFormValid(e.message, null);
        return;
      }
    } else return;

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
        <Button variant="bordered" size="md" className={'border-none px-0'}>
          Google
        </Button>
        /
        <Button variant="bordered" size="md" className={'border-none px-0'}>
          Yandex
        </Button>
      </p>
    </Form>
  );
}

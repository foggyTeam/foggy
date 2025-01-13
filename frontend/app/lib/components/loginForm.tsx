'use client';

import React, { useState } from 'react';
import { Button } from '@nextui-org/button';
import { Form } from '@nextui-org/form';
import { Input } from '@nextui-org/input';

enum ButtonAction {
  UNDEFINED,
  LOGIN,
  SIGNIN,
}

export default function LoginForm() {
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
      console.log('await sign in check backend');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSigninButtonLoading(false);
      // if (!isFormValid(emailError, passwordError)) return;
      setAction(ButtonAction.UNDEFINED);
    } else if (action === ButtonAction.LOGIN) {
      setLoginButtonLoading(true);
      console.log('await log in check backend');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setLoginButtonLoading(false);
      // if (!isFormValid(emailError, passwordError)) return;
    } else return;

    setErrors({});

    console.log('Submitted!');
  };

  return (
    <Form
      className={'flex min-w-24 flex-col gap-2 sm:w-80'}
      onSubmit={onSubmit}
      validationErrors={errors}
    >
      <Input
        isClearable
        isRequired
        errorMessage={errors.email}
        label="Email"
        labelPlacement="inside"
        name="email"
        type="email"
        autocomplete="email"
        size="md"
      />

      <Input
        isClearable
        isRequired
        errorMessage={errors.password}
        label="Password"
        labelPlacement="inside"
        name="password"
        type={passwordVisible ? 'text' : 'password'}
        size="md"
        autocomplete="current-password"
      />

      <div className={'flex w-full justify-between'}>
        <Button
          onPress={() => setAction(ButtonAction.SIGNIN)}
          type={action === ButtonAction.SIGNIN ? 'submit' : 'button'}
          isLoading={signinButtonLoading}
          variant="light"
          color="primary"
          size="md"
        >
          sign in
        </Button>
        <Button
          onPress={() => setAction(ButtonAction.LOGIN)}
          isLoading={loginButtonLoading}
          type="submit"
          variant="solid"
          color="primary"
          size="md"
        >
          log in
        </Button>
      </div>

      <Button variant="bordered" size="md" className={'border-none'}>
        Login with Google / Yandex
      </Button>
    </Form>
  );
}

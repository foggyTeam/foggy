'use server';

import { signIn } from '@/auth';

export async function signUserIn(credentials, register: boolean = false) {
  await signIn('credentials', {
    ...credentials,
    register: register ? 'true' : '',
    redirect: false,
  }).catch((e) => {
    throw new Error(`${e.message.split('.')[0]}.`);
  });

  return;
}

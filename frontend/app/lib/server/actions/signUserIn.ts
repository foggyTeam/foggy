'use server';

import { signIn } from '@/auth';

export async function signUserIn(credentials, register: boolean = false) {
  await signIn('credentials', {
    ...credentials,
    register: register ? 'yes' : '',
    redirect: false,
  }).catch((error) => {
    throw error;
  });
}

'use server';

import { signIn } from '@/auth';

export async function signUserIn(
  credentials: { email: string; password: string },
  register: boolean = false,
) {
  await signIn('credentials', {
    ...credentials,
    register: register ? 'yes' : '',
    redirect: false,
  }).catch((error: any) => {
    throw error;
  });
}

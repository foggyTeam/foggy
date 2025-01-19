'use server';

import { signIn } from '@/auth';
import { AvailableProviders } from '@/app/lib/utils/definitions';

export async function signUserViaProviders(provider: AvailableProviders) {
  if (provider === AvailableProviders.GOOGLE)
    await signIn('google', { callbackUrl: '' });
  else await signIn('yandex', { callbackUrl: '' });
}

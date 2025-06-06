'use server';

import { signIn, signOut } from '@/auth';
import { AvailableProviders } from '@/app/lib/types/definitions';
import { clearSession } from '@/app/lib/session';
import {
  deleteRequest,
  getRequest,
  patchRequest,
} from '@/app/lib/server/requests';
import getUserId from '@/app/lib/getUserId';

export async function SignUserIn(
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
export async function SignUserViaProviders(provider: AvailableProviders) {
  if (provider === AvailableProviders.GOOGLE)
    await signIn('google', { redirectTo: '/' });
  else await signIn('yandex', { redirectTo: '/' });
}
export async function SignUserOut() {
  await signOut().catch((error: any) => {
    throw error;
  });
}
export async function ClearUserSession() {
  await clearSession();
}

export async function GetUserById() {
  return await getRequest(`users/${await getUserId()}`);
}
export async function DeleteUserById() {
  return await deleteRequest(`users/${await getUserId()}`);
}
export async function UpdateUserData(data: any) {
  return await patchRequest(`users/update/${await getUserId()}`, data);
}

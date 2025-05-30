'use server';

import { patchRequest } from '@/app/lib/server/requests';
import getUserId from '@/app/lib/getUserId';

export async function updateUserData(data: any) {
  return await patchRequest(`users/update/${await getUserId()}`, data);
}

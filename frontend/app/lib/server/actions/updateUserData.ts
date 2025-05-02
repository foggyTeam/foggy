'use server';

import { patchRequest } from '@/app/lib/server/requests';

export async function updateUserData(id: string, data: any) {
  return await patchRequest(`users/update/${id}`, data);
}

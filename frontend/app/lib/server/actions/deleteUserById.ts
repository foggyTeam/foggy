'use server';

import { deleteRequest } from '@/app/lib/server/requests';

export async function deleteUserById(id: string) {
  return await deleteRequest(`users/${id}`);
}

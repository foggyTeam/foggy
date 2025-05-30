'use server';

import { deleteRequest } from '@/app/lib/server/requests';
import getUserId from '@/app/lib/getUserId';

export async function deleteUserById() {
  return await deleteRequest(`users/${await getUserId()}`);
}

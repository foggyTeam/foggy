import {
  deleteRequest,
  getRequest,
  patchRequest,
} from '@/app/lib/server/requests';
import getUserId from '@/app/lib/getUserId';
import { Team } from '@/app/lib/types/definitions';

export async function GetTeam(id: string) {
  return await getRequest(`teams/${id}`, {
    headers: {
      'x-user-id': await getUserId(),
    },
  });
}
export async function UpdateTeam(id: string, data: Partial<Team>) {
  return await patchRequest(`teams/${id}`, data, {
    headers: { 'x-user-id': await getUserId() },
  });
}
export async function DeleteTeam(id: string) {
  return await deleteRequest(`teams/${id}`, {
    headers: { 'x-user-id': await getUserId() },
  });
}

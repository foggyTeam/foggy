'use server';

import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from '@/app/lib/server/requests';
import { Project, Team } from '@/app/lib/types/definitions';
import getUserId from '@/app/lib/getUserId';

export async function GetAllTeams() {
  return await getRequest(`teams`, {
    headers: {
      'x-user-id': await getUserId(),
    },
  });
}

export async function AddNewTeam(data: Partial<Team>) {
  return await postRequest(
    'teams',
    {
      name: data.name,
      avatar: data.avatar,
      description: '',
      settings: data.settings,
    },
    { headers: { 'x-user-id': await getUserId() } },
  );
}
export async function GetShortTeamInfo(id: string) {
  return await getRequest(`teams/${id}/brief`, {
    headers: {
      'x-user-id': await getUserId(),
    },
  });
}
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

'use server';

import {
  deleteRequest,
  patchRequest,
  postRequest,
} from '@/app/lib/server/requests';
import { Project } from '@/app/lib/types/definitions';
import getUserId from '@/app/lib/getUserId';

export async function AddNewProject(data: Partial<Project>) {
  return await postRequest(
    'projects',
    {
      name: data.name,
      avatar: data.avatar,
      description: data.description,
      settings: data.settings,
    },
    { headers: { 'x-user-id': await getUserId() } },
  );
}

export async function UpdateProject(id: string, data: Partial<Project>) {
  return await patchRequest(`projects/${id}`, data, {
    headers: { 'x-user-id': await getUserId() },
  });
}

export async function DeleteProject(id: string) {
  return await deleteRequest(`projects/${id}`, {
    headers: { 'x-user-id': await getUserId() },
  });
}

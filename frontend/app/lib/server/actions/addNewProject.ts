'use server';

import { postRequest } from '@/app/lib/server/requests';
import { Project } from '@/app/lib/types/definitions';
import getUserId from '@/app/lib/getUserId';

export async function addNewProject(data: Partial<Project>) {
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

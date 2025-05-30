'use server';

import {
  deleteRequest,
  patchRequest,
  postRequest,
} from '@/app/lib/server/requests';
import getUserId from '@/app/lib/getUserId';

export async function SearchUsers(data: {
  query: string;
  projectId: string;
  limit: number;
  cursor: string;
}) {
  return await postRequest(`users/search`, data, {
    headers: { 'x-user-id': await getUserId() },
  });
}

export async function AddProjectMember(
  projectId: string,
  data: { userId: string; role: 'admin' | 'editor' | 'reader' },
) {
  return await postRequest(`projects/${projectId}/users`, data, {
    headers: { 'x-user-id': await getUserId() },
  });
}

export async function UpdateProjectMemberRole(
  projectId: string,
  data: { userId: string; role: 'admin' | 'editor' | 'reader' | 'owner' },
) {
  return await patchRequest(`projects/${projectId}/users/role`, data, {
    headers: { 'x-user-id': await getUserId() },
  });
}

export async function DeleteProjectMember(projectId: string) {
  return await deleteRequest(
    `projects/${projectId}/users/${await getUserId()}`,
  );
}

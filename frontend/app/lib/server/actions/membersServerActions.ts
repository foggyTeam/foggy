'use server';

import {
  deleteRequest,
  patchRequest,
  postRequest,
} from '@/app/lib/server/requests';
import getUserId from '@/app/lib/getUserId';
import { Role } from 'aws-sdk/clients/s3';

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
  data: { userId: string; role: Omit<Role, 'owner'> },
) {
  return await postRequest(`projects/${projectId}/users`, data, {
    headers: { 'x-user-id': await getUserId() },
  });
}

export async function UpdateProjectMemberRole(
  projectId: string,
  data: { userId: string; role: Role },
) {
  // TODO: update url when ready
  return await patchRequest(
    `projects/${projectId}/users/${data.userId}/role`,
    data,
    {
      headers: { 'x-user-id': await getUserId() },
    },
  );
}

export async function DeleteProjectMember(projectId: string, userId: string) {
  return await deleteRequest(`projects/${projectId}/users/${userId}`, {
    headers: { 'x-user-id': await getUserId() },
  });
}

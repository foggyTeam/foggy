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

const expirationTimesMap: Record<string, number | null> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '3m': 3 * 31 * 24 * 60 * 60 * 1000,
  '6m': 6 * 31 * 24 * 60 * 60 * 1000,
  '12m': 12 * 31 * 24 * 60 * 60 * 1000,
  never: 10 * 12 * 31 * 24 * 60 * 60 * 1000,
};
function getExpiresAt(term: keyof typeof expirationTimesMap) {
  const ms = expirationTimesMap[term];
  return new Date(Date.now() + ms).toISOString();
}
export async function AddProjectMember(
  projectId: string,
  data: {
    userId: string;
    role: Omit<Role, 'owner'>;
    expirationTime: keyof typeof expirationTimesMap;
  },
) {
  return await postRequest(
    `projects/${projectId}/users`,
    { ...data, expiresAt: getExpiresAt(data.expirationTime) },
    {
      headers: { 'x-user-id': await getUserId() },
    },
  );
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

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
  projectId?: string;
  teamId?: string;
  limit: number;
  cursor: string;
}) {
  return await postRequest(`users/search`, data, {
    headers: { 'x-user-id': await getUserId() },
  });
}

const expirationTimesMap: Record<string, number> = {
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

// PROJECT
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

export async function DeleteProjectMember(
  projectId: string,
  userId: string,
  newOwnerId?: string | null,
) {
  return await deleteRequest(
    newOwnerId
      ? `projects/${projectId}/users/${userId}?newOwner=${newOwnerId}`
      : `projects/${projectId}/users/${userId}`,
    {
      headers: { 'x-user-id': await getUserId() },
    },
  );
}

// TEAM
export async function AddTeamMember(
  teamId: string,
  data: {
    userId: string;
    role: Omit<Role, 'owner'>;
    expirationTime: keyof typeof expirationTimesMap;
  },
) {
  return await postRequest(
    `teams/${teamId}/members`,
    { ...data, expiresAt: getExpiresAt(data.expirationTime) },
    {
      headers: { 'x-user-id': await getUserId() },
    },
  );
}

export async function UpdateTeamMemberRole(
  teamId: string,
  data: { userId: string; role: Role },
) {
  return await patchRequest(
    `teams/${teamId}/members/${data.userId}/role`,
    data,
    {
      headers: { 'x-user-id': await getUserId() },
    },
  );
}

export async function DeleteTeamMember(
  teamId: string,
  userId: string,
  newOwnerId?: string | null,
) {
  return await deleteRequest(
    newOwnerId
      ? `teams/${teamId}/members/${userId}?newOwner=${newOwnerId}`
      : `teams/${teamId}/members/${userId}`,
    {
      headers: { 'x-user-id': await getUserId() },
    },
  );
}

export async function GetInvitationLink(
  type: 'project' | 'team',
  data: {
    id: string;
    role: Omit<Role, 'owner'>;
    expirationTime: keyof typeof expirationTimesMap;
  },
): Promise<string> {
  // TODO: real request
  const token = await new Promise((resolve) =>
    setTimeout(() => resolve(`somestringhere${data}${type}`), 500),
  );
  return `${process.env.FRONTEND_URI}/invitation/${token}`;
}

export async function ProcessInvitationToken(token: string): Promise<any> {
  // TODO: decrypt real request
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          accepted: true,
          type: 'project',
          id: '693d249238ecad24dc5f4b71',
        }),
      3000,
    ),
  );
}

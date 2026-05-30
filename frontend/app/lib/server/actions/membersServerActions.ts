'use server';

import {
  deleteRequest,
  getRequest,
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

export async function SearchAll(data: {
  query: string;
  projectId?: string;
  limit: number;
  usersCursor: string;
  teamsCursor: string;
}) {
  return await postRequest(
    `users/search-all`,
    { ...data, teamsLimit: data.limit, usersLimit: data.limit },
    {
      headers: { 'x-user-id': await getUserId() },
    },
  );
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
  type: 'user' | 'team',
  data: {
    id: string;
    role: Omit<Role, 'owner'>;
    expirationTime: keyof typeof expirationTimesMap;
  },
) {
  console.log(type, data);
  return await (type === 'user'
    ? postRequest(
        `projects/${projectId}/users`,
        {
          userId: data.id,
          role: data.role,
          expiresAt: getExpiresAt(data.expirationTime),
        },
        {
          headers: { 'x-user-id': await getUserId() },
        },
      )
    : postRequest(
        `projects/${projectId}/teams`,
        {
          teamId: data.id,
          role: data.role,
          expiresAt: getExpiresAt(data.expirationTime),
        },
        {
          headers: { 'x-user-id': await getUserId() },
        },
      ));
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
  const query = newOwnerId ? `?newOwnerId=${newOwnerId}` : '';
  return await deleteRequest(`projects/${projectId}/users/${userId}${query}`, {
    headers: { 'x-user-id': await getUserId() },
  });
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
  newOwnerId?: string,
) {
  const query = newOwnerId ? `?newOwnerId=${newOwnerId}` : '';
  return await patchRequest(`teams/${teamId}/members/role${query}`, data, {
    headers: { 'x-user-id': await getUserId() },
  });
}

export async function DeleteTeamMember(
  teamId: string,
  userId: string,
  newOwnerId?: string | null,
) {
  const query = newOwnerId ? `?newOwnerId=${newOwnerId}` : '';
  return await deleteRequest(`teams/${teamId}/members/${userId}${query}`, {
    headers: { 'x-user-id': await getUserId() },
  });
}

/** TEAMS not implemented yet. */
export async function GetInvitationLink(
  type: 'project' | 'team',
  data: {
    id: string;
    role: Omit<Role, 'owner'>;
    expirationTime: keyof typeof expirationTimesMap;
  },
): Promise<string> {
  const url = `${type === 'project' ? 'projects' : 'teams'}/${data.id}/invite-links`;
  const requestData = {
    role: data.role,
    expiresAt: getExpiresAt(data.expirationTime),
  };
  const result = await postRequest(url, requestData, {
    headers: {
      'x-user-id': await getUserId(),
    },
  });
  if ('errors' in result) throw new Error(result.errors.toString());
  return `${process.env.FRONTEND_URI}/invitation/${type}/${result.data.token}`;
}

export async function ProcessInvitationToken(
  type: 'project' | 'team',
  token: string,
  accept: boolean = false,
): Promise<any> {
  const url = `${type === 'project' ? `projects` : 'teams'}/invite/${token}?accept=${accept}`;
  return await getRequest(url, {
    headers: {
      'x-user-id': await getUserId(),
    },
  });
}

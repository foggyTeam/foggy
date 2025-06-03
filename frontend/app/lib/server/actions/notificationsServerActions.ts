'use server';

import {
  deleteRequest,
  getRequest,
  postRequest,
} from '@/app/lib/server/requests';
import getUserId from '@/app/lib/getUserId';
import { Role } from '@/app/lib/types/definitions';

export async function GetAllNotifications() {
  return getRequest(`notifications`, {
    headers: { 'x-user-id': await getUserId() },
  });
}

export async function GetUnreadNumber() {
  return getRequest(`notifications/unread-count`, {
    headers: { 'x-user-id': await getUserId() },
  });
}

export async function DeleteNotification(notificationId: string) {
  return deleteRequest(`notifications/${notificationId}`, {
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
export async function InviteInProject(
  memberId: string,
  projectId: string,
  role: Role,
  expirationTime: keyof typeof expirationTimesMap,
) {
  return postRequest(
    `notifications/project-invite`,
    {
      recipientId: memberId,
      projectId,
      role,
      expiresAt: getExpiresAt(expirationTime),
    },
    {
      headers: { 'x-user-id': await getUserId() },
    },
  );
}

export async function JoinProjectRequest(
  projectId: string,
  role: Role,
  message: string,
) {
  return postRequest(
    `notifications/project-join-request`,
    {
      entityId: projectId,
      customMessage: message,
      role,
    },
    {
      headers: { 'x-user-id': await getUserId() },
    },
  );
}

export async function AnswerNotification(
  notificationId: string,
  accept: boolean,
) {
  if (accept) {
    return postRequest(`notifications/${notificationId}/accept`, {
      headers: { 'x-user-id': await getUserId() },
    });
  } else {
    return postRequest(`notifications/${notificationId}/reject`, {
      headers: { 'x-user-id': await getUserId() },
    });
  }
}

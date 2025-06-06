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
  console.log(await getUserId());
  return getRequest(`notifications/unread-count`, {
    headers: { 'x-user-id': await getUserId() },
  });
}

export async function DeleteNotification(notificationId: string) {
  return deleteRequest(`notifications/${notificationId}`, {
    headers: { 'x-user-id': await getUserId() },
  });
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
    return postRequest(`notifications/${notificationId}/accept`, null, {
      headers: { 'x-user-id': await getUserId() },
    });
  } else {
    return postRequest(`notifications/${notificationId}/reject`, null, {
      headers: { 'x-user-id': await getUserId() },
    });
  }
}

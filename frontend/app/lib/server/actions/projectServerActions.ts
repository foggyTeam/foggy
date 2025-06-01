'use server';

import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from '@/app/lib/server/requests';
import { Project } from '@/app/lib/types/definitions';
import getUserId from '@/app/lib/getUserId';

export async function GetAllProjects() {
  return await getRequest(`projects`, {
    headers: {
      'x-user-id': await getUserId(),
    },
  });
}

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
export async function GetProject(id: string) {
  return await getRequest(`projects/${id}`, {
    headers: {
      'x-user-id': await getUserId(),
    },
  });
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

export async function AddSection(
  projectId: string,
  data: { name: string; parentSectionId: string },
) {
  return await postRequest(`projects/${projectId}/sections`, data, {
    headers: { 'x-user-id': await getUserId() },
  });
}
export async function GetSection(projectId: string, sectionId: string) {
  return await getRequest(`projects/${projectId}/sections/${sectionId}`, {
    headers: { 'x-user-id': await getUserId() },
  });
}
export async function UpdateSection(
  projectId: string,
  sectionId: string,
  data: { name: string },
) {
  return await patchRequest(
    `projects/${projectId}/sections/${sectionId}`,
    data,
    {
      headers: { 'x-user-id': await getUserId() },
    },
  );
}
export async function DeleteSection(projectId: string, sectionId: string) {
  return await deleteRequest(`projects/${projectId}/sections/${sectionId}`, {
    headers: { 'x-user-id': await getUserId() },
  });
}

export async function AddBoard(
  projectId: string,
  data: { sectionId: string; name: string; type: string },
) {
  return await postRequest(
    'boards',
    { projectId, ...data },
    {
      headers: { 'x-user-id': await getUserId() },
    },
  );
}
export async function GetBoard(id: string) {
  return await getRequest(`boards/${id}`, {
    headers: {
      'x-user-id': await getUserId(),
    },
  });
}
export async function UpdateBoard(id: string, data: { name: string }) {
  return await patchRequest(`boards/${id}`, data, {
    headers: { 'x-user-id': await getUserId() },
  });
}
export async function DeleteBoard(id: string) {
  return await deleteRequest(`boards/${id}`, {
    headers: { 'x-user-id': await getUserId() },
  });
}

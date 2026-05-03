'use server';

import { Board, BoardTypes, Project } from '@/app/lib/types/definitions';
import { getAiAdapter } from '@/app/lib/server/ai/factory';

export async function GetBoardSummary(
  boardId: Board['id'],
  boardImageUrl: string,
  requestId?: string,
) {
  return getAiAdapter().summarize({
    boardId,
    imageUrl: boardImageUrl,
    requestId,
  });
}

export async function GetProjectStructure(
  boardId: Board['id'],
  boardImageUrl: string,
  projectId: Project['id'],
  requestId?: string,
) {
  return getAiAdapter().structurize({
    boardId,
    imageUrl: boardImageUrl,
    projectId,
    requestId,
  });
}

export async function GenerateBoardTemplate(
  projectId: string,
  sectionId: string,
  name: string,
  type: BoardTypes,
  prompt?: string,
  requestId?: string,
) {
  return getAiAdapter().generateTemplate({
    projectId,
    sectionId,
    boardName: name,
    boardType: type,
    prompt,
    requestId,
  });
}

export async function CheckGenerationStatus(jobId: string) {
  return getAiAdapter().getJobStatus(jobId);
}

export async function AbortJob(jobId: string) {
  return getAiAdapter().abortJob(jobId);
}

'use server';

import { Board, BoardTypes, Project } from '@/app/lib/types/definitions';
import { getAiAdapter } from '@/app/lib/server/ai/factory';

export async function GetBoardSummary(
  boardId: Board['id'],
  boardImageUrl: string,
) {
  return getAiAdapter().summarize({
    boardId,
    imageUrl: boardImageUrl,
  });
}

export async function GetProjectStructure(
  boardId: Board['id'],
  boardImageUrl: string,
  projectId: Project['id'],
) {
  return getAiAdapter().structurize({
    boardId,
    imageUrl: boardImageUrl,
    projectId,
  });
}

export async function GenerateBoardTemplate(
  name: string,
  type: BoardTypes,
  prompt?: string,
) {
  return getAiAdapter().generateTemplate({
    boardName: name,
    boardType: type,
    prompt,
  });
}

export async function CheckGenerationStatus(jobId: string) {
  return getAiAdapter().getJobStatus(jobId);
}

export async function AbortJob(jobId: string) {
  return getAiAdapter().abortJob(jobId);
}

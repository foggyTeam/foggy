'use server';

import { Board, BoardTypes, Project } from '@/app/lib/types/definitions';
import { getAiAdapter } from '@/app/lib/server/ai/factory';

export async function GetBoardSummary(boardId: Board['id']) {
  return getAiAdapter().summarize({
    boardId,
  });
}

export async function GetProjectStructure(
  boardId: Board['id'],
  projectId: Project['id'],
) {
  return getAiAdapter().structurize({
    boardId,
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

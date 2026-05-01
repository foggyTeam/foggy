import 'server-only';
import { IAiAdapter } from '@/app/lib/server/ai/adapter';
import {
  AiBoard,
  AiElement,
  AiFile,
  AiGEdge,
  AiGenerateTemplateArgs,
  AiGenerateTemplateRequest,
  AiGenerateTemplateResponse,
  AiGNode,
  AiJob,
  AiStructurizeArgs,
  AiStructurizeRequest,
  AiStructurizeResponse,
  AiSummarizeArgs,
  AiSummarizeRequest,
  AiSummarizeResponse,
} from '@/app/lib/server/ai/types';
import {
  GetBoard,
  GetProject,
  GetSection,
} from '@/app/lib/server/actions/projectServerActions';
import { Board, Project, ProjectSection } from '@/app/lib/types/definitions';
import { externalPostRequest } from '@/app/lib/server/requests';
import getUserId from '@/app/lib/getUserId';

const apiUri = process.env.AI_URI;
const verificationKey = process.env.VERIFICATION_KEY;

function generateRequestId(
  requestType: 'summarize' | 'structurize' | 'template',
  data: object,
) {
  return `${requestType}-${Object.values(data).join('-').slice(0, 16)}-${Date.now()}`;
}

export class DirectAdapter implements IAiAdapter {
  private async prepareAiBoard(boardId: Board['id'], imageUrl?: string) {
    const board: Board | null = await GetBoard(boardId);
    if (!board) throw new Error('Failed to load board');

    return {
      boardId,
      imageUrl,
      elements:
        board.type === 'SIMPLE'
          ? (board.layers.flat() as AiElement[])
          : undefined,
      graphEdges:
        board.type === 'GRAPH' ? (board.graphEdges as AiGEdge[]) : undefined,
      graphNodes:
        board.type === 'GRAPH' ? (board.graphNodes as AiGNode[]) : undefined,
    } as AiBoard;
  }
  private async prepareAiProject(projectId: Project['id']) {
    const project: Project | null = await GetProject(projectId);
    if (!project) throw new Error('Failed to load project');

    async function dfs(
      item:
        | ProjectSection
        | Pick<Board, 'id' | 'name' | 'sectionId' | 'type' | 'lastChange'>,
    ) {
      let children: AiFile[] = [];

      if ('children' in item) {
        if (item.childrenNumber !== item.children.size) {
          try {
            const loadedSection: ProjectSection | null = await GetSection(
              projectId,
              item.id,
            );
            if (!loadedSection) throw new Error();

            children = await Promise.all(
              [...loadedSection.children.values()].map(dfs),
            );
          } catch (e: any) {
            console.warn('[AI]: Failed to load section. Skipping');
          }
        } else
          children = await Promise.all([...item.children.values()].map(dfs));
      }

      return {
        name: item.name,
        type: 'type' in item ? item.type?.toLowerCase() : 'section',
        children,
      } as AiFile;
    }

    const rootSections = await Promise.all(
      [...project.sections.values()].map(dfs),
    );
    const projectFile: AiFile = {
      name: project.name,
      type: 'section',
      children: rootSections,
    };

    return projectFile;
  }

  /** @param data
   *  @throws Error */
  async summarize(
    data: AiSummarizeArgs,
  ): Promise<AiSummarizeResponse | string | undefined> {
    const { boardId, imageUrl } = data;

    const requestBoard = await this.prepareAiBoard(boardId, imageUrl);

    const request = {
      requestId: generateRequestId('summarize', { boardId }),
      userId: await getUserId(),
      requestType: 'summarize',
      board: requestBoard,
    } as AiSummarizeRequest;

    return externalPostRequest(`${apiUri}/summarize`, request, {
      headers: { 'x-api-key': verificationKey },
    });
  }

  /** @param data
   *  @throws Error */
  async structurize(
    data: AiStructurizeArgs,
  ): Promise<AiStructurizeResponse | string | undefined> {
    const { boardId, imageUrl, projectId } = data;

    const requestBoard = await this.prepareAiBoard(boardId, imageUrl);
    const requestProject = await this.prepareAiProject(projectId);

    const request = {
      requestId: generateRequestId('structurize', { boardId, projectId }),
      userId: await getUserId(),
      requestType: 'structurize',
      board: requestBoard,
      file: requestProject,
    } as AiStructurizeRequest;

    return externalPostRequest(`${apiUri}/structurize`, request, {
      headers: { 'x-api-key': verificationKey },
    });
  }

  /** @param data
   *  @throws Error */
  async generateTemplate(
    data: AiGenerateTemplateArgs,
  ): Promise<AiGenerateTemplateResponse | string | undefined> {
    const { boardName, boardType, prompt } = data;

    const request = {
      requestId: generateRequestId('template', { boardType }),
      userId: await getUserId(),
      requestType: 'generateTemplate',
      boardId: 'someid',
      boardType: boardType.toLowerCase(),
      prompt: prompt || boardName,
    } as AiGenerateTemplateRequest;

    return externalPostRequest(`${apiUri}/template`, request, {
      headers: { 'x-api-key': verificationKey },
    });
  }

  /** @param jobId
   *  @throws Error */
  async abortJob(jobId: string): Promise<void> {
    return Promise.resolve(null);
  }

  /** @param jobId
   *  @throws Error */
  async getJobStatus(jobId: string): Promise<AiJob> {
    return Promise.resolve(null);
  }
}

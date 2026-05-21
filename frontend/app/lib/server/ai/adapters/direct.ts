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
import { HtmlToDelta } from 'quill-delta-from-html';
import {
  AddBoard,
  GetBoard,
  GetProject,
  GetSection,
  SaveBoardSnapshot,
} from '@/app/lib/server/actions/projectServerActions';
import {
  Board,
  BoardTypes,
  Project,
  ProjectSection,
} from '@/app/lib/types/definitions';
import {
  externalGetRequest,
  externalPostRequest,
  externalPutRequest,
} from '@/app/lib/server/requests';
import getUserId from '@/app/lib/getUserId';
import * as Y from 'yjs';

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

  private prepareDocPayload(text: string) {
    const yDoc = new Y.Doc();
    const yText = yDoc.getText('quill-content');

    const converter = new HtmlToDelta();
    const parsedDelta = converter.convert(text);

    let deltaOps = Array.isArray(parsedDelta) ? parsedDelta : parsedDelta.ops;

    yText.applyDelta(deltaOps || []);

    const update = Y.encodeStateAsUpdate(yDoc);

    return Buffer.from(update).toString('base64');
  }

  private async loadBoardTemplate(boardType: BoardTypes, aiBoard: AiBoard) {
    const { boardId, graphNodes, graphEdges, elements, text } = aiBoard;

    let payload;
    switch (boardType) {
      case 'SIMPLE':
        payload = {
          layers: [
            (elements || []).map((el) => {
              if (el.type === 'rectangle' && 'content' in el)
                return {
                  ...el,
                  type: 'text',
                  svg: '',
                };

              return el;
            }),
            [],
            [],
          ] as any[],
        };
        break;
      case 'GRAPH':
        payload = {
          edges: graphEdges as any[],
          nodes: (graphNodes || []).map((node) => ({
            position: { x: 0, y: 0 },
            ...node,
          })) as any[],
        };
        break;
      case 'DOC':
        payload = { document: this.prepareDocPayload(text || '') };
    }

    return SaveBoardSnapshot(boardId, payload);
  }

  /** @param data
   *  @throws Error */
  async summarize(
    data: AiSummarizeArgs,
  ): Promise<AiSummarizeResponse | string | undefined> {
    const { boardId, imageUrl, requestId } = data;

    const requestBoard = await this.prepareAiBoard(boardId, imageUrl);

    const request = {
      requestId: requestId || generateRequestId('summarize', { boardId }),
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
    const { boardId, imageUrl, projectId, requestId } = data;

    const requestBoard = await this.prepareAiBoard(boardId, imageUrl);
    const requestProject = await this.prepareAiProject(projectId);

    const request = {
      requestId:
        requestId || generateRequestId('structurize', { boardId, projectId }),
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
  ): Promise<any | { requestId: string; jobId: string }> {
    const { projectId, sectionId, boardName, boardType, prompt, requestId } =
      data;

    const id = requestId || generateRequestId('template', { boardType });
    const request = {
      requestId: id,
      userId: await getUserId(),
      requestType: boardType === 'DOC' ? 'generateText' : 'generateTemplate',
      boardId: id,
      boardType: boardType.toLowerCase(),
      prompt: prompt || boardName,
    } as AiGenerateTemplateRequest;

    const response: AiGenerateTemplateResponse | string | undefined =
      await externalPostRequest(`${apiUri}/template`, request, {
        headers: { 'x-api-key': verificationKey },
      });
    if (!response) throw new Error('Failed to generate');

    if (typeof response === 'string') return { requestId: id, jobId: response };

    const createBoardResponse = await AddBoard(projectId, {
      sectionId,
      name: boardName,
      type: boardType.toLowerCase(),
    });

    if ('errors' in createBoardResponse)
      throw new Error(createBoardResponse.errors[0]);
    await this.loadBoardTemplate(boardType, {
      ...response.board,
      text: response.content,
      boardId: createBoardResponse.data.id,
    });
    return { boardId: createBoardResponse.data.id };
  }

  /** @param jobId
   *  @throws Error */
  async abortJob(jobId: string): Promise<void> {
    return externalPutRequest(`${apiUri}/jobs/${jobId}/abort`, {
      headers: { 'x-api-key': verificationKey },
    });
  }

  /** @param jobId
   *  @throws Error */
  async getJobStatus(jobId: string): Promise<AiJob> {
    return externalGetRequest(`${apiUri}/jobs/${jobId}`, {
      headers: { 'x-api-key': verificationKey },
    });
  }
}

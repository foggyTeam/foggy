import 'server-only';
import { IAiAdapter } from '@/app/lib/server/ai/adapter';
import {
  AiBoard,
  AiElement,
  AiGEdge,
  AiGenerateTemplateArgs,
  AiGNode,
  AiJob,
  AiStructurizeArgs,
  AiSummarizeArgs,
  AiSummarizeRequest,
  AiSummarizeResponse,
} from '@/app/lib/server/ai/types';
import { GetBoard } from '@/app/lib/server/actions/projectServerActions';
import { Board } from '@/app/lib/types/definitions';
import { notFound } from 'next/navigation';
import { externalPostRequest } from '@/app/lib/server/requests';
import getUserId from '@/app/lib/getUserId';

const apiUri = process.env.AI_URI;
const verificationKey = process.env.VERIFICATION_KEY;

function generateRequestId(
  requestType: 'summarize' | 'structurize' | 'template',
  data: any,
) {
  return `${requestType}-${JSON.stringify(data).slice(0, 16)}-${Date.now()}`;
}

export class DirectAdapter implements IAiAdapter {
  async summarize(
    request: AiSummarizeArgs,
  ): Promise<AiSummarizeResponse | string | { error: any }> {
    const { boardId, imageUrl } = request;

    try {
      const board: Board | null = await GetBoard(boardId);

      if (!board) notFound();

      const requestBoard = {
        boardId,
        imageUrl,
        elements:
          board.type === 'SIMPLE'
            ? ([...board.layers] as AiElement[])
            : undefined,
        graphEdges:
          board.type === 'GRAPH' ? (board.graphEdges as AiGEdge[]) : undefined,
        graphNodes:
          board.type === 'GRAPH' ? (board.graphNodes as AiGNode[]) : undefined,
      } as AiBoard;

      const request = {
        requestId: generateRequestId('summarize', { boardId }),
        userId: await getUserId(),
        requestType: 'summarize',
        board: requestBoard,
      } as AiSummarizeRequest;

      return externalPostRequest(`${apiUri}/summarize`, request, {
        headers: { 'x-api-key': verificationKey },
      });
    } catch (e: any) {
      return { error: e };
    }
  }

  async structurize(request: AiStructurizeArgs): Promise<any> {
    console.log(request);
    return Promise.resolve(null);
  }

  async generateTemplate(request: AiGenerateTemplateArgs): Promise<any> {
    console.log(request);
    return Promise.resolve(null);
  }

  async abortJob(jobId: string): Promise<void> {
    console.log(jobId);
    return Promise.resolve(null);
  }

  async getJobStatus(jobId: string): Promise<AiJob> {
    console.log(jobId);
    return Promise.resolve(null);
  }
}

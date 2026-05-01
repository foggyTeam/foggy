import 'server-only';
import { IAiAdapter } from '@/app/lib/server/ai/adapter';
import {
  AiGenerateTemplateArgs,
  AiJob,
  AiStructurizeArgs,
  AiSummarizeArgs,
} from '@/app/lib/server/ai/types';

// TODO: implement all standard server actions via requests.ts
export class BackendAdapter implements IAiAdapter {
  async structurize(request: AiStructurizeArgs): Promise<any> {
    throw new Error('Backend adapter not implemented yet');
  }

  async summarize(request: AiSummarizeArgs): Promise<any> {
    throw new Error('Backend adapter not implemented yet');
  }

  async abortJob(jobId: string): Promise<void> {
    throw new Error('Backend adapter not implemented yet');
  }

  async generateTemplate(request: AiGenerateTemplateArgs): Promise<any> {
    throw new Error('Backend adapter not implemented yet');
  }

  async getJobStatus(jobId: string): Promise<AiJob> {
    throw new Error('Backend adapter not implemented yet');
  }
}

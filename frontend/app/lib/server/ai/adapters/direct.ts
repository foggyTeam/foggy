import 'server-only';
import { IAiAdapter } from '@/app/lib/server/ai/adapter';
import {
  AiGenerateTemplateArgs,
  AiJob,
  AiStructurizeArgs,
  AiSummarizeArgs,
} from '@/app/lib/server/ai/types';

export class DirectAdapter implements IAiAdapter {
  structurize(request: AiStructurizeArgs): Promise<any> {
    throw new Error('Direct adapter not implemented yet');
  }

  summarize(request: AiSummarizeArgs): Promise<any> {
    throw new Error('Direct adapter not implemented yet');
  }

  abortJob(jobId: string): Promise<void> {
    throw new Error('Direct adapter not implemented yet');
  }

  generateTemplate(request: AiGenerateTemplateArgs): Promise<any> {
    throw new Error('Direct adapter not implemented yet');
  }

  getJobStatus(jobId: string): Promise<AiJob> {
    throw new Error('Direct adapter not implemented yet');
  }
}

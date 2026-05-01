import 'server-only';

// Единый API для работы с AI Service напрямую или через бэкенд.
import type { AiJob } from './types';
import {
  AiGenerateTemplateArgs,
  AiStructurizeArgs,
  AiSummarizeArgs,
} from './types';

export interface IAiAdapter {
  /** gets board summary */
  summarize(request: AiSummarizeArgs): Promise<any>;

  /** gets structure based on board data */
  structurize(request: AiStructurizeArgs): Promise<any>;

  /** gets board template based on prompt */
  generateTemplate(request: AiGenerateTemplateArgs): Promise<any>;

  /** gets job status (polling) */
  getJobStatus(jobId: string): Promise<AiJob>;

  /** aborts a job */
  abortJob(jobId: string): Promise<void>;
}

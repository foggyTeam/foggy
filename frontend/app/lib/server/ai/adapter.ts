import 'server-only';

/** Единый API для работы с AI Service напрямую или через бэкенд. */

import type {
  AiGenerateTemplateRequest,
  AiGenerateTemplateResponse,
  AiIncrementalRequest,
  AiIncrementalResponse,
  AiJob,
  AiStructurizeRequest,
  AiStructurizeResponse,
  AiSummarizeRequest,
  AiSummarizeResponse,
} from './types';

export interface IAiAdapter {
  /** gets board summary */
  summarize(req: AiSummarizeRequest): Promise<AiSummarizeResponse>;

  /** gets structure based on board data */
  structurize(req: AiStructurizeRequest): Promise<AiStructurizeResponse>;

  /** gets board template based on prompt */
  generateTemplate(
    req: AiGenerateTemplateRequest,
  ): Promise<AiGenerateTemplateResponse>;

  /** incremental analysis of board updates */
  summarizeIncremental(
    req: AiIncrementalRequest,
  ): Promise<AiIncrementalResponse>;

  /** gets job status (polling) */
  getJobStatus(jobId: string): Promise<AiJob>;

  /** aborts a job */
  abortJob(jobId: string): Promise<void>;
}

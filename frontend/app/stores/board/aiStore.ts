import { makeAutoObservable, observable, reaction } from 'mobx';
import { Board } from '@/app/lib/types/definitions';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import {
  CheckGenerationStatus,
  GenerateBoardTemplate,
  GetBoardSummary,
  GetProjectStructure,
} from '@/app/lib/server/ai/aiServerActions';

const POLLING_INTERVAL = 10_000;

interface Job {
  requestId: string;
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'aborted';
  jobAction?: () => any;
  onSuccessCallback?: (generationResult: any) => void;
  onErrorCallback?: (error?: any) => void;
}

interface TemplateJob extends Job {
  type: 'generateTemplate';
  prompt: string;
  board: Board;
}
interface SummarizeJob extends Job {
  type: 'summarize';
  boardId: string;
  imageUrl: string;
}

interface StructurizeJob extends Job {
  type: 'structurize';
  boardId: string;
  imageUrl: string;
  projectId: string;
}

type AiJob = TemplateJob | SummarizeJob | StructurizeJob;

class AiStore {
  /** requestId is key */
  loadingJobsMap = observable.map<string, AiJob>();
  pollingInterval: number | null;

  constructor() {
    makeAutoObservable(this, {});
    reaction(
      () => this.loadingJobsMap.size,
      (size: number) => {
        if (size > 0 && this.pollingInterval === null) {
          this.pollingInterval = setInterval(this.checkJobs, POLLING_INTERVAL);
        } else if (size === 0 && this.pollingInterval !== null) {
          clearInterval(this.pollingInterval);
          this.pollingInterval = null;
        }
      },
    );
  }

  // ACTIONS
  async generateTemplate(
    projectId: string,
    newBoard: Omit<Board, 'id'>,
    prompt?: string,
    onSuccessCallback?: (generationResult: any) => void,
    onErrorCallback?: (error?: any) => void,
  ) {
    let job: Omit<TemplateJob, 'jobId' | 'requestId'> = {
      type: 'generateTemplate',
      prompt: prompt || newBoard.name,
      status: 'pending',
      board: {
        ...newBoard,
        id: `temp-id-${Date.now()}`,
      } as Board,
      onSuccessCallback,
      onErrorCallback,
    };

    try {
      const result = await GenerateBoardTemplate(
        projectId,
        newBoard.sectionId,
        newBoard.name,
        newBoard.type,
        prompt,
      );

      if (!result) throw new Error();

      if ('jobId' in result)
        this.loadingJobsMap.set(result.requestId, {
          ...job,
          ...result,
          jobAction: async () =>
            await GenerateBoardTemplate(
              projectId,
              newBoard.sectionId,
              newBoard.name,
              newBoard.type,
              prompt,
              result.requestId,
            ),
        });
      else this.onGenerationSuccess(result, onSuccessCallback, job.prompt);
    } catch (e: any) {
      this.onGenerationError(e.message, onErrorCallback);
    }
  }

  async generateSummary(
    boardId: string,
    boardImageUrl: string,
    onSuccessCallback?: (generationResult: any) => void,
    onErrorCallback?: (error?: any) => void,
  ) {
    let job: Omit<SummarizeJob, 'jobId' | 'requestId'> = {
      type: 'summarize',
      status: 'pending',
      boardId,
      imageUrl: boardImageUrl,
      onSuccessCallback,
      onErrorCallback,
    };

    try {
      const result = await GetBoardSummary(job.boardId, job.imageUrl);

      if (!result) throw new Error();

      if ('jobId' in result)
        this.loadingJobsMap.set(result.requestId, {
          ...job,
          ...result,
          jobAction: async () =>
            await GetBoardSummary(job.boardId, job.imageUrl, result.requestId),
        });
      else this.onGenerationSuccess(result, onSuccessCallback);
    } catch (e: any) {
      this.onGenerationError(e.message, onErrorCallback);
    }
  }

  async generateStructure(
    boardId: string,
    boardImageUrl: string,
    projectId: string,
    onSuccessCallback?: (generationResult: any) => void,
    onErrorCallback?: (error?: any) => void,
  ) {
    let job: Omit<StructurizeJob, 'jobId' | 'requestId'> = {
      type: 'structurize',
      status: 'pending',
      boardId,
      imageUrl: boardImageUrl,
      projectId,
      onSuccessCallback,
    };

    try {
      const result = await GetProjectStructure(
        job.boardId,
        job.imageUrl,
        job.projectId,
      );

      if (!result) throw new Error();

      if ('jobId' in result)
        this.loadingJobsMap.set(result.requestId, {
          ...job,
          ...result,
          jobAction: async () =>
            await GetProjectStructure(
              job.boardId,
              job.imageUrl,
              job.projectId,
              result.requestId,
            ),
        });
      else this.onGenerationSuccess(result, onSuccessCallback);
    } catch (e: any) {
      this.onGenerationError(e.message, onErrorCallback);
    }
  }

  // POLLING
  async checkJobs() {
    await Promise.all(
      [...this.loadingJobsMap.entries()].map(async ([requestId, job]) => {
        try {
          const jobStatus = await CheckGenerationStatus(job.jobId);

          this.loadingJobsMap.set(requestId, {
            ...job,
            status: jobStatus.status,
          } as AiJob);

          if (
            (jobStatus.status === 'pending' ||
              jobStatus.status === 'running') &&
            jobStatus.retries <= 10
          )
            return;

          if (jobStatus.status === 'completed') {
            const result = await job.jobAction?.();
            this.onGenerationSuccess(result, job.onSuccessCallback);
            this.loadingJobsMap.delete(requestId);
            return;
          }

          if (jobStatus.retries > 10)
            throw new Error('Maximum retries achieved!');

          throw new Error(jobStatus.status);
        } catch (e: any) {
          // TODO: add abort
          this.loadingJobsMap.delete(requestId);
          this.onGenerationError(e.message, job.onErrorCallback);
        }
      }),
    );
  }

  onGenerationSuccess(
    result: any,
    callback?: (generationResult: any) => void,
    description?: string,
  ) {
    addToast({
      color: 'success',
      severity: 'success',
      title: settingsStore.t.toasts.board.generateSuccess,
      description,
    });
    if (callback) callback(result);
  }
  onGenerationError(description?: string, callback?: (error?: any) => void) {
    addToast({
      color: 'danger',
      severity: 'danger',
      title: settingsStore.t.toasts.board.generateError,
      description: description || undefined,
    });
    if (callback) callback(description);
  }
}

const aiStore = new AiStore();
export default aiStore;

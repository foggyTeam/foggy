import { makeAutoObservable, observable, reaction } from 'mobx';
import { Board } from '@/app/lib/types/definitions';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import {
  CheckGenerationStatus,
  GenerateBoardTemplate,
} from '@/app/lib/server/ai/aiServerActions';

interface Job {
  requestId: string;
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'aborted';
  onSuccessCallback?: (generationResult: any) => void;
}

interface TemplateJob extends Job {
  type: 'generateTemplate';
  prompt: string;
  board: Board;
}

type AiJob = TemplateJob;

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
          this.pollingInterval = setInterval(this.checkJobs, 1000);
        } else if (size === 0 && this.pollingInterval !== null) {
          clearInterval(this.pollingInterval);
          this.pollingInterval = null;
        }
      },
    );
  }

  // ACTIONS
  async generateTemplate(
    newBoard: Omit<Board, 'id'>,
    prompt?: string,
    onSuccessCallback?: (generationResult: any) => void,
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
    };

    try {
      const result = await GenerateBoardTemplate(
        job.board.id,
        newBoard.name,
        newBoard.type,
        prompt,
      );

      if ('jobId' in result)
        this.loadingJobsMap.set(result.requestId, Object.assign(job, result));
      else this.onGenerationSuccess(onSuccessCallback, null, job.prompt);
    } catch (e: any) {
      this.onGenerationError(e.message);
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
          });

          if (
            (jobStatus.status === 'pending' ||
              jobStatus.status === 'running') &&
            jobStatus.retries <= 10
          )
            return;

          if (jobStatus.status === 'completed') {
            // TODO: proceed job data
            this.onGenerationSuccess(null, job.onSuccessCallback);
            this.loadingJobsMap.delete(requestId);
            return;
          }

          if (jobStatus.retries > 10)
            throw new Error('Maximum retries achieved!');

          throw new Error(jobStatus.status);
        } catch (e: any) {
          // TODO: add abort
          this.loadingJobsMap.delete(requestId);
          this.onGenerationError(e.message);
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
      title: settingsStore.t.toasts.board.generateTemplateError,
      description,
    });
    callback?.(result);
  }
  onGenerationError(description?: string) {
    addToast({
      color: 'danger',
      severity: 'danger',
      title: settingsStore.t.toasts.board.generateTemplateError,
      description: description || undefined,
    });
  }
}

const aiStore = new AiStore();
export default aiStore;

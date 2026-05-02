import { action, makeAutoObservable, observable } from 'mobx';
import { Board, BoardTypes } from '@/app/lib/types/definitions';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import {
  AbortJob,
  CheckGenerationStatus,
  GenerateBoardTemplate,
} from '@/app/lib/server/ai/aiServerActions';

class AiStore {
  isLoading: boolean = false;
  isPolling: boolean = false;
  pollingInterval: number | null;

  constructor() {
    makeAutoObservable(this, {
      isLoading: observable,
      isPolling: observable,
      pollingInterval: observable,

      startLoading: action,
      endLoading: action,
      generateTemplate: action,
      startPolling: action,
      endPolling: action,
    });
  }

  // LOADING BAR
  startLoading() {
    this.isLoading = true;
  }
  endLoading() {
    this.isLoading = false;
  }

  // ACTIONS
  async generateTemplate(
    boardId: Board['id'],
    boardName: string,
    boardType: BoardTypes,
    prompt?: string,
  ) {
    this.startLoading();

    try {
      const result = await GenerateBoardTemplate(
        boardId,
        boardName,
        boardType,
        prompt,
      );

      if (result && typeof result === 'string') {
        this.startPolling(result);
        return;
      }
    } catch (e: any) {
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.board.generateTemplateError,
        description: e?.message || undefined,
      });
    }
    this.endLoading();
  }

  // POLLING
  startPolling(jobId: string) {
    this.isPolling = true;

    this.pollingInterval = setInterval(async () => {
      try {
        const job = await CheckGenerationStatus(jobId);
        if (job.status === 'completed') this.endPolling(jobId, 'success');
        if (job.retries > 10) this.endPolling(jobId, 'timeout');
        if (job.status !== 'pending' && job.status !== 'running')
          this.endPolling(jobId, 'error');
      } catch (e: any) {
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.board.generateTemplateError,
          description: e?.message || undefined,
        });
        this.isPolling = false;
      }
    }, 1000);
  }

  endPolling(jobId: string, reason: 'success' | 'timeout' | 'error') {
    if (reason === 'timeout') AbortJob(jobId);
    if (reason !== 'success')
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.board.generateTemplateError,
      });

    if (this.pollingInterval !== null) clearInterval(this.pollingInterval);
    this.isPolling = false;
    this.endLoading();
  }
}

const aiStore = new AiStore();
export default aiStore;

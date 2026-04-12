import { makeAutoObservable, reaction } from 'mobx';
import boardStore from '@/app/stores/board/boardStore';
import { Socket } from 'socket.io-client';

let socketRef: Socket | null = null;

class DocBoardStore {
  private cleanupListeners: (() => void) | null = null;
  constructor() {
    makeAutoObservable(this, {});

    reaction(
      () => boardStore.boardWebsocket,
      (socket) => {
        this.cleanupListeners?.();
        this.cleanupListeners = null;
        socketRef = socket;

        if (!socket) return;
        if (boardStore.activeBoard?.type === 'DOC') {
          this.socketAddEventListeners(socket);
          this.cleanupListeners = () => {
            this.socketRemoveEventListeners(socket);
          };
        }
      },
    );
  }

  // WEBSOCKET
  private socketAddEventListeners(socket: Socket) {
    if (!socket) return;
  }
  private socketRemoveEventListeners(socket: Socket) {
    // for (const event of GraphBoardEvents) socket.removeAllListeners(event);
  }
  private emitSocketEvent(event: string, data: any) {
    socketRef?.emit(event, data);
  }

  // GENERAL
  setDocData(data: any) {
    if (!data) return;
  }
}

const docBoardStore = new DocBoardStore();
export default docBoardStore;

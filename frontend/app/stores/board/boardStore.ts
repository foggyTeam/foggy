import { action, makeAutoObservable, observable } from 'mobx';
import { Board, BoardTypes } from '@/app/lib/types/definitions';
import userStore from '@/app/stores/userStore';
import { Socket } from 'socket.io-client';
import openBoardSocketConnection from '@/app/lib/utils/boardSocketConnection';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import projectsStore from '@/app/stores/projectsStore';

class BoardStore {
  boardWebsocket: Socket | null = null;

  activeBoard: Board | undefined = undefined;

  constructor() {
    makeAutoObservable(this, {
      activeBoard: observable,

      setActiveBoard: action,
    });
  }

  setActiveBoard = (board: any | undefined) => {
    if (!board) {
      this.activeBoard = board;
      this.disconnectSocket();
    } else {
      this.activeBoard = {
        ...board,
        layers: [],
        lastChange: board.updatedAt,
        type: board.type.toUpperCase() as BoardTypes,
      } as Board;

      projectsStore.addRecentBoard(
        projectsStore.activeProject?.id || '',
        board.sectionId,
        board.id,
        board.name,
        board.type.toUpperCase() as BoardTypes,
      );
      this.connectSocket(this.activeBoard.id || '');
    }
  };

  connectSocket(boardId: string) {
    if (!userStore.user?.id) return;
    if (boardId) {
      this.boardWebsocket = openBoardSocketConnection(
        boardId,
        userStore.user.id,
      );
    } else
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.socket.socketConnectionError.title,
        description:
          settingsStore.t.toasts.socket.socketConnectionError.description,
      });
  }
  disconnectSocket() {
    if (this.boardWebsocket) {
      this.boardWebsocket.disconnect();
      this.boardWebsocket = null;
    }
  }
}

const boardStore = new BoardStore();
export default boardStore;

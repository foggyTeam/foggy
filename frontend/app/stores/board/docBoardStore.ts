import { makeAutoObservable, observable, reaction } from 'mobx';
import boardStore from '@/app/stores/board/boardStore';
import { Socket } from 'socket.io-client';
import * as Y from 'yjs';
import {
  applyAwarenessUpdate,
  Awareness,
  encodeAwarenessUpdate,
} from 'y-protocols/awareness';

let socketRef: Socket | null = null;

class DocBoardStore {
  yDoc: Y.Doc | null = null;
  yText: Y.Text | null = null;
  awareness: Awareness | null = null;

  private cleanupListeners: (() => void) | null = null;

  constructor() {
    makeAutoObservable(this, {
      yDoc: observable,
      yText: observable,
    });

    reaction(
      () => boardStore.boardWebsocket,
      (socket) => {
        this.cleanupListeners?.();
        this.cleanupListeners = null;
        socketRef = socket;

        if (!socket) return;

        if (boardStore.activeBoard?.type === 'DOC') {
          this.socketAddEventListeners(socket);
          this.cleanupListeners = () => this.socketRemoveEventListeners(socket);
        }
      },
    );
  }

  // WEBSOCKET
  private socketAddEventListeners(socket: Socket) {
    socket.on('docSync', (update: ArrayBuffer) => {
      if (this.yDoc) Y.applyUpdate(this.yDoc, new Uint8Array(update), 'sync');
    });

    socket.on('docUpdate', (update: ArrayBuffer) => {
      if (this.yDoc) {
        Y.applyUpdate(this.yDoc, new Uint8Array(update), this);
      }
    });

    socket.on('awarenessUpdate', (update: ArrayBuffer) => {
      if (this.awareness) {
        applyAwarenessUpdate(this.awareness, new Uint8Array(update), this);
      }
    });
  }

  private socketRemoveEventListeners(socket: Socket) {
    socket.off('docSync');
    socket.off('docUpdate');
    socket.off('awarenessUpdate');
  }

  // YJS
  private handleDocUpdate = (update: Uint8Array, origin: any) => {
    // TODO: think on 'origin'
    if (origin !== this) socketRef?.emit('docUpdate', update);
  };

  private handleAwarenessUpdate = (
    { added, updated, removed }: any,
    origin: any,
  ) => {
    if (origin === 'local' && this.awareness) {
      const changedClients = added.concat(updated, removed);
      const update = encodeAwarenessUpdate(this.awareness, changedClients);
      socketRef?.emit('awarenessUpdate', update);
    }
  };

  // GENERAL
  setDocData(data: true | undefined) {
    if (this.yDoc) {
      this.yDoc.off('update', this.handleDocUpdate);
      this.awareness?.off('update', this.handleAwarenessUpdate);
      this.awareness?.destroy();
      this.yDoc.destroy();

      this.yDoc = null;
      this.yText = null;
      this.awareness = null;
    }

    if (!data) return;

    this.yDoc = new Y.Doc();
    this.yText = this.yDoc.getText('quill-content');
    this.awareness = new Awareness(this.yDoc);

    this.yDoc.on('update', this.handleDocUpdate);
    this.awareness.on('update', this.handleAwarenessUpdate);
  }
}

const docBoardStore = new DocBoardStore();
export default docBoardStore;

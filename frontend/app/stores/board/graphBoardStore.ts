import {
  action,
  IObservableArray,
  makeAutoObservable,
  observable,
  reaction,
} from 'mobx';
import boardStore from '@/app/stores/board/boardStore';
import { Socket } from 'socket.io-client';
import { GBaseNode, GEdge } from '@/app/lib/types/definitions';
import { EdgeChange, NodeChange } from '@xyflow/react';

const GraphBoardEvents = ['nodesUpdate', 'edgesUpdate'];

let socketRef: Socket | null = null;

class GraphBoardStore {
  nodesExternalUpdatesQueue: NodeChange[][] = [];
  edgesExternalUpdatesQueue: EdgeChange[][] = [];

  boardNodes: IObservableArray<GBaseNode> | undefined = undefined;
  boardEdges: IObservableArray<GEdge> | undefined = undefined;

  nodesApplyUpdatesTrigger: boolean = false;
  edgesApplyUpdatesTrigger: boolean = false;

  private cleanupListeners: (() => void) | null = null;
  constructor() {
    makeAutoObservable(this, {
      boardNodes: observable,
      boardEdges: observable,
      nodesApplyUpdatesTrigger: observable,
      edgesApplyUpdatesTrigger: observable,

      setGraphData: action,
    });

    reaction(
      () => boardStore.boardWebsocket,
      (socket) => {
        this.cleanupListeners?.();
        this.cleanupListeners = null;
        socketRef = socket;

        if (!socket) return;
        if (boardStore.activeBoard?.type === 'GRAPH') {
          this.socketAddEventListeners(socket);
          this.cleanupListeners = () => {
            this.socketRemoveEventListeners(socket);
            this.nodesExternalUpdatesQueue = [];
            this.edgesExternalUpdatesQueue = [];
          };
        }
      },
    );
  }

  // WEBSOCKET
  private socketAddEventListeners(socket: Socket) {
    if (!socket) return;

    socket.on('nodesUpdate', (changes: any) => {
      this.nodesExternalUpdatesQueue.push(changes);
      this.nodesApplyUpdatesTrigger = !this.nodesApplyUpdatesTrigger;
    });

    socket.on('edgesUpdate', (changes: any) => {
      this.edgesExternalUpdatesQueue.push(changes);
      this.edgesApplyUpdatesTrigger = !this.edgesApplyUpdatesTrigger;
    });
  }
  private socketRemoveEventListeners(socket: Socket) {
    for (const event of GraphBoardEvents) socket.removeAllListeners(event);
  }
  private emitSocketEvent(event: string, data: any) {
    socketRef?.emit(event, data);
  }

  emitUpdates = (eventType: 'nodesUpdate' | 'edgesUpdate', changes: any) => {
    this.emitSocketEvent(eventType, changes);
  };

  clearUpdatesQueue(queueType: 'nodes' | 'edges') {
    if (queueType === 'nodes') this.nodesExternalUpdatesQueue = [];
    else this.edgesExternalUpdatesQueue = [];
  }

  // GENERAL
  setGraphData(
    data:
      | { nodes: GBaseNode[] | undefined; edges: GEdge[] | undefined }
      | undefined,
  ) {
    if (!data) {
      this.boardEdges = undefined;
      this.boardNodes = undefined;
      return;
    }
    this.boardNodes = observable.array(data.nodes || []);
    this.boardEdges = observable.array(data.edges || []);
  }
}

const graphBoardStore = new GraphBoardStore();
export default graphBoardStore;

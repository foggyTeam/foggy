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

const GraphBoardEvents = [];

let socketRef: Socket | null = null;

class GraphBoardStore {
  boardNodes: IObservableArray<GBaseNode> | undefined = undefined;
  boardEdges: IObservableArray<GEdge> | undefined = undefined;

  private cleanupListeners: (() => void) | null = null;
  constructor() {
    makeAutoObservable(this, {
      boardNodes: observable,
      boardEdges: observable,

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
          this.cleanupListeners = () => this.socketRemoveEventListeners(socket);
        }
      },
    );
  }

  // WEBSOCKET
  private socketAddEventListeners(socket: Socket) {
    if (!socket) return;
  }
  private socketRemoveEventListeners(socket: Socket) {
    for (const event of GraphBoardEvents) socket.removeAllListeners(event);
  }
  private emitSocketEvent(event: string, data: any) {
    socketRef?.emit(event, data);
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

  // CRUD
  updateNodes(nodes: GBaseNode[]) {
    this.boardNodes?.replace(nodes);
    console.log('update');
  }
  updateEdges(edges: GEdge[]) {
    this.boardEdges?.replace(edges);
  }
}

const graphBoardStore = new GraphBoardStore();
export default graphBoardStore;

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

  nodesMap = observable.map<string, number>();
  edgesMap = observable.map<string, number>();

  private cleanupListeners: (() => void) | null = null;
  constructor() {
    makeAutoObservable(this, {
      boardNodes: observable,
      boardEdges: observable,
      nodesMap: observable,
      edgesMap: observable,

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
    this.boardNodes = observable.array(
      (data.nodes || []).map((node) => observable(node)),
    );
    this.boardEdges = observable.array(
      (data.edges || []).map((node) => observable(node)),
    );

    this.buildElementsMap();
  }
  buildElementsMap() {
    this.nodesMap.clear();
    if (!this.boardNodes) return;
    for (let nodeIndex = 0; nodeIndex < this.boardNodes.length; nodeIndex++) {
      const element = this.boardNodes[nodeIndex];
      this.nodesMap.set(element.id, nodeIndex);
    }

    this.edgesMap.clear();
    if (!this.boardEdges) return;
    for (let edgeIndex = 0; edgeIndex < this.boardEdges?.length; edgeIndex++) {
      const element = this.boardEdges[edgeIndex];
      this.edgesMap.set(element.id, edgeIndex);
    }
  }

  // CRUD
}

const graphBoardStore = new GraphBoardStore();
export default graphBoardStore;

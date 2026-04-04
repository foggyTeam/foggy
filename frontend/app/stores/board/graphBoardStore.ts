import {
  action,
  IObservableArray,
  makeAutoObservable,
  observable,
  ObservableMap,
  reaction,
} from 'mobx';
import boardStore from '@/app/stores/board/boardStore';
import { Socket } from 'socket.io-client';
import { GEdge, GNode } from '@/app/lib/types/definitions';
import { EdgeChange, NodeChange } from '@xyflow/react';

const GraphBoardEvents = ['nodesUpdate', 'edgesUpdate', 'nodeDataUpdate'];

let socketRef: Socket | null = null;

class GraphBoardStore {
  nodesExternalUpdatesQueue: NodeChange[][] = [];
  edgesExternalUpdatesQueue: EdgeChange[][] = [];

  boardNodes: IObservableArray<GNode> | undefined = undefined;
  boardEdges: IObservableArray<GEdge> | undefined = undefined;

  nodesDataMap: ObservableMap<GNode['id'], GNode['data']> | undefined =
    undefined;

  nodesApplyUpdatesTrigger: boolean = false;
  edgesApplyUpdatesTrigger: boolean = false;

  private cleanupListeners: (() => void) | null = null;
  constructor() {
    makeAutoObservable(this, {
      boardNodes: observable,
      boardEdges: observable,
      nodesApplyUpdatesTrigger: observable,
      edgesApplyUpdatesTrigger: observable,
      nodesDataMap: observable,

      setGraphData: action,
      updateNodeData: action,
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

    socket.on(
      'nodeDataUpdate',
      ({
        nodeId,
        newAttrs,
        isNew,
      }: {
        nodeId: GNode['id'];
        newAttrs: Partial<GNode['data']>;
        isNew?: boolean;
      }) => {
        this.updateNodeData(nodeId, newAttrs, isNew, true);
      },
    );
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
      | { nodes: GNode[] | undefined; edges: GEdge[] | undefined }
      | undefined,
  ) {
    if (!data) {
      this.boardEdges = undefined;
      this.boardNodes = undefined;
      this.nodesDataMap = undefined;
      return;
    }

    const nodeData = data.nodes?.map((node): [string, GNode['data']] => {
      return [node.id, observable(node.data)];
    });
    this.boardNodes = observable.array(data.nodes || []);
    this.nodesDataMap = observable.map(nodeData);
    this.boardEdges = observable.array(data.edges || []);
  }

  // NODE DATA
  updateNodeData(
    nodeId: GNode['id'],
    newAttrs: Partial<GNode['data']>,
    isNew?: boolean,
    external?: boolean,
  ) {
    if (!this.nodesDataMap || !this.boardNodes) return false;
    if (isNew) {
      this.nodesDataMap.set(nodeId, observable(newAttrs));
    } else {
      if (!this.nodesDataMap.has(nodeId)) {
        const nodeIndex = this.boardNodes?.findIndex(
          (node) => node.id === nodeId,
        );
        if (nodeIndex < 0) return false;
        this.nodesDataMap.set(nodeId, this.boardNodes[nodeIndex].data);
      }
      const node = this.nodesDataMap.get(nodeId);
      if (node) Object.assign(node, newAttrs);
    }
    if (!external)
      this.emitSocketEvent('nodeDataUpdate', { nodeId, newAttrs, isNew });
    return true;
  }
  clearRemovedNodes(nodes: GNode[]) {
    // очистка устаревших нод, только если их число кратно 10
    if (!this.nodesDataMap || this.nodesDataMap?.size % 10) return;
    for (const id in [...this.nodesDataMap.keys()]) {
      const nodeIndex = nodes?.findIndex((node) => node.id === id);
      if (nodeIndex < 0) this.nodesDataMap?.delete(id);
    }
  }
}

const graphBoardStore = new GraphBoardStore();
export default graphBoardStore;

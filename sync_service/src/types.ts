import { WebSocket } from 'ws';

export type BoardType = 'SIMPLE' | 'GRAPH' | 'DOC';

export interface RoomClient {
  ws: WebSocket;
  userId: string;
  nickname: string;
  color: string;
}

export interface SimpleBoardState {
  layers: any[][];
}

export interface GraphBoardState {
  nodes: any[];
  edges: any[];
}

export interface Room {
  boardId: string;
  type: BoardType;
  clients: Map<string, RoomClient>; // userId -> клиент
  state: SimpleBoardState | GraphBoardState | null;
  snapshotTimer: ReturnType<typeof setTimeout> | null;
}

export interface WsMessage {
  event: string;
  data: any;
}

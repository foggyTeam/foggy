import type { Socket } from 'socket.io';

// BOARD TYPES
export type BoardType = 'SIMPLE' | 'GRAPH' | 'DOC';

// CURSORS
/** Auth payload that the cursor socket sends on connect */
export interface CursorAuth {
  id: string;
  nickname: string;
  avatar: string;
  color: string;
  boardId: string;
}

/** Attached to socket.data in the cursor namespace */
export interface CursorClientData extends CursorAuth {}

// ELEMENTS
/** Auth payload the elements socket sends on connect */
export interface ElementsAuth {
  boardId: string;
  /** Board type is needed to select the right state strategy */
  boardType?: BoardType;
}

/** Attached to socket.data in the elements namespace */
export interface ElementsClientData {
  boardId: string;
  userId: string;
}

// IN-MEMORY STATE

export interface SimpleBoardState {
  /** Array-of-layers; each layer is an ordered array of elements */
  layers: any[][];
}

export interface GraphBoardState {
  nodes: any[];
  edges: any[];
}

// ROOMS

export interface Room {
  boardId: string;
  type: BoardType;
  /** Current in-memory snapshot; null until first event or initial fetch */
  state: SimpleBoardState | GraphBoardState | null;
  /** True when state has changed since the last POST to the backend */
  dirty: boolean;
  /** setInterval handle for periodic snapshot flushing */
  snapshotTimer: ReturnType<typeof setInterval> | null;
}

// SOCKET

/** socket.io Socket extended with our data shape (elements namespace) */
export type ElementsSocket = Socket & { data: ElementsClientData };

/** socket.io Socket extended with our data shape (cursor namespace) */
export type CursorSocket = Socket & { data: CursorClientData };

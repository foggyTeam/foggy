import { Room, BoardType, RoomClient } from './types';

/** All rooms handler **/
const rooms = new Map<string, Room>();

export function getOrCreateRoom(boardId: string, type: BoardType): Room {
  if (!rooms.has(boardId)) {
    rooms.set(boardId, {
      boardId,
      type,
      clients: new Map(),
      state: null,
      snapshotTimer: null,
    });
    console.info(`New room: ${boardId} (${type})`);
  }
  return rooms.get(boardId)!;
}

export function getRoom(boardId: string): Room | undefined {
  return rooms.get(boardId);
}

export function joinRoom(room: Room, client: RoomClient): void {
  room.clients.set(client.userId, client);
  console.info(
    `User ${client.userId} joined room ${room.boardId}, total: ${room.clients.size}`,
  );
}

export function leaveRoom(room: Room, userId: string): void {
  room.clients.delete(userId);
  console.info(
    `User ${userId} left room ${room.boardId}, remaining: ${room.clients.size}`,
  );

  if (room.clients.size === 0) {
    if (room.snapshotTimer) clearTimeout(room.snapshotTimer);
    rooms.delete(room.boardId);
    console.warn(`Room deleted: ${room.boardId}`);
  }
}

export function broadcast(
  room: Room,
  senderUserId: string,
  message: string,
): void {
  for (const [userId, client] of room.clients) {
    /** 1 = OPEN **/
    if (userId !== senderUserId && client.ws.readyState === 1) {
      client.ws.send(message);
    }
  }
}

export function sendTo(room: Room, userId: string, message: string): void {
  const client = room.clients.get(userId);
  if (client && client.ws.readyState === 1) {
    client.ws.send(message);
  }
}

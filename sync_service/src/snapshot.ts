import * as Y from 'yjs';
import {
  DocBoardState,
  GraphBoardState,
  Room,
  SimpleBoardState,
} from './types.js';

const SNAPSHOT_INTERVAL_MS = 10_000;

// INITIAL STATE

/**
 * Fetches the last saved snapshot from the backend REST API.
 * Returns null if the endpoint is unavailable or returns a non-200 response
 * (e.g. during the migration period before the backend implements the route).
 */
export async function fetchInitialSnapshot(
  boardId: string,
): Promise<
  SimpleBoardState | GraphBoardState | Omit<DocBoardState, 'yDoc'> | null
> {
  const backendUrl = process.env.BACKEND_URI;
  if (!backendUrl) return null;

  try {
    const res = await fetch(`${backendUrl}/boards/${boardId}/snapshot`, {
      headers: { 'x-service-key': process.env.SYNC_VERIFICATION_KEY ?? '' },
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) {
      console.warn(
        `[snapshot] GET /boards/${boardId}/snapshot → ${res.status}, starting with empty state`,
      );
      return null;
    }
    const data = await res.json();
    console.info(`[snapshot] loaded initial state for board ${boardId}`);
    return data as
      | SimpleBoardState
      | GraphBoardState
      | Omit<DocBoardState, 'yDoc'>;
  } catch (err) {
    console.warn(
      `[snapshot] could not fetch initial state for ${boardId}:`,
      (err as Error).message,
    );
    return null;
  }
}

// Snapshot flush
/**
 * POSTs the current in-memory state to the backend.
 * Clears the dirty flag on success.
 */
export async function flushSnapshot(room: Room): Promise<void> {
  if (!room.dirty || !room.state) return;

  const backendUrl = process.env.BACKEND_URI;
  if (!backendUrl) return;

  let payload: any = room.state;

  if (room.type === 'DOC' && 'yDoc' in room.state && room.state.yDoc) {
    const update = Y.encodeStateAsUpdate(room.state.yDoc);
    const documentData = Buffer.from(update).toString('base64');
    payload = { document: documentData };
  }

  try {
    const res = await fetch(`${backendUrl}/boards/${room.boardId}/snapshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-key': process.env.SYNC_VERIFICATION_KEY ?? '',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      console.error(`[snapshot] POST ${room.boardId} failed: ${res.status}`);
      return;
    }
    room.dirty = false;
    console.info(`[snapshot] flushed ${room.boardId}`);
  } catch (err) {
    console.error(
      `[snapshot] flush error for ${room.boardId}:`,
      (err as Error).message,
    );
  }
}

// Interval scheduler

/**
 * Starts a periodic flush timer for the room.
 * Should be called once when the room is first created.
 * The timer is cleared automatically in deleteRoom().
 */
export function startSnapshotTimer(room: Room): void {
  if (room.snapshotTimer) return;

  room.snapshotTimer = setInterval(async () => {
    if (room.dirty) await flushSnapshot(room);
  }, SNAPSHOT_INTERVAL_MS);
}

/**
 * Performs a final flush and then removes the room from memory.
 * Call this when the last user leaves a room.
 */
export async function finalFlushAndDelete(
  room: Room,
  deleteRoomFn: (boardId: string) => void,
): Promise<void> {
  try {
    await flushSnapshot(room);
  } finally {
    deleteRoomFn(room.boardId);
  }
}

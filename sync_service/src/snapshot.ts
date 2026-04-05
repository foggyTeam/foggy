import { GraphBoardState, Room, SimpleBoardState } from './types';
import * as Y from 'yjs';

const SNAPSHOT_INTERVAL_MS = 10_000;
const BACKEND_URL = process.env.BACKEND_URL;

// INITIAL STATE
/**
 * Fetches the last saved snapshot from the backend REST API.
 * Returns null if the endpoint is unavailable or returns a non-200 response
 * (e.g. during the migration period before the backend implements the route).
 */
export async function fetchInitialSnapshot(
  boardId: string,
): Promise<SimpleBoardState | GraphBoardState | null> {
  if (!BACKEND_URL) return null;

  try {
    const res = await fetch(`${BACKEND_URL}/boards/${boardId}/snapshot`, {
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
    return data as SimpleBoardState | GraphBoardState;
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

  if (!BACKEND_URL) return;

  try {
    const res = await fetch(`${BACKEND_URL}/boards/${room.boardId}/snapshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-key': process.env.SYNC_VERIFICATION_KEY ?? '',
      },
      body: JSON.stringify(room.state),
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

export async function flushDocSnapshot(
  boardId: string,
  ydoc: Y.Doc,
): Promise<void> {
  if (!BACKEND_URL) return;

  const update = Y.encodeStateAsUpdate(ydoc);
  const snapshot = Buffer.from(update).toString('base64');

  try {
    const res = await fetch(`${BACKEND_URL}/boards/${boardId}/snapshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-key': process.env.SYNC_VERIFICATION_KEY ?? '',
      },
      body: JSON.stringify({ snapshot }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      console.error(`[snapshot] POST doc ${boardId} failed: ${res.status}`);
      return;
    }
    console.info(`[snapshot] flushed doc ${boardId}`);
  } catch (err) {
    console.error(
      `[snapshot] doc flush error for ${boardId}:`,
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
  if (room.snapshotTimer) return; // already running

  room.snapshotTimer = setInterval(async () => {
    if (room.dirty) await flushSnapshot(room);
  }, SNAPSHOT_INTERVAL_MS) as number;
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

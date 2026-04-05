import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import {
  BoardType,
  CursorClientData,
  CursorSocket,
  ElementsClientData,
  ElementsSocket,
  GraphBoardState,
  SimpleBoardState,
} from './types';
import {
  deleteRoom,
  getOrCreateRoom,
  getRoom,
  graphApplyEdgeChanges,
  graphApplyNodeChanges,
  graphUpdateNodeData,
  markDirty,
  simpleAddElement,
  simpleChangeElementLayer,
  simpleRemoveElement,
  simpleUpdateElement,
} from './rooms';
import {
  fetchInitialSnapshot,
  finalFlushAndDelete,
  startSnapshotTimer,
} from './snapshot';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ─── Config ──────────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT) || 1234;
const FRONTEND_ORIGIN = process.env.FRONTEND_URI ?? '*';

// ─── HTTP server (only /health for Render healthcheck) ───────────────────────

const httpServer = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }
  res.writeHead(404);
  res.end();
});

// ─── Socket.IO server ────────────────────────────────────────────────────────

const io = new IOServer(httpServer, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Disconnect stale sockets quickly to keep in-memory rooms lean
  pingTimeout: 20_000,
  pingInterval: 25_000,
});

// ─────────────────────────────────────────────────────────────────────────────
//  Namespace: /elements
//  Used for all board-element operations (SIMPLE + GRAPH boards).
//  Auth:    socket.handshake.auth.boardId
//           socket.handshake.auth.boardType  (optional, e.g. "SIMPLE"|"GRAPH")
//  Headers: x-user-id
// ─────────────────────────────────────────────────────────────────────────────

const elements = io.of('/elements');

elements.use((socket, next) => {
  const { boardId, boardType } = socket.handshake.auth as {
    boardId?: string;
    boardType?: string;
  };
  const userId = (socket.handshake.headers['x-user-id'] as string) ?? socket.id;

  if (!boardId) {
    return next(new Error('boardId required'));
  }

  (socket as ElementsSocket).data = {
    boardId,
    userId,
  } satisfies ElementsClientData;

  next();
});

elements.on('connection', async (rawSocket) => {
  const socket = rawSocket as ElementsSocket;
  const { boardId, userId } = socket.data;

  // Infer board type from auth (fallback to SIMPLE)
  const authType = (
    socket.handshake.auth as { boardType?: string }
  ).boardType?.toUpperCase() as BoardType | undefined;
  const boardType: BoardType = authType ?? 'SIMPLE';

  // Join the socket.io room named by boardId
  socket.join(boardId);

  // Create room if first visitor; load initial state from backend
  const isNew = !getRoom(boardId);
  const room = getOrCreateRoom(boardId, boardType);

  if (isNew) {
    startSnapshotTimer(room);
    const initialState = await fetchInitialSnapshot(boardId);
    if (initialState) {
      room.state = initialState;
    } else {
      // Bootstrap empty state so mutations have something to work with
      if (boardType === 'SIMPLE') {
        room.state = { layers: [[]] } satisfies SimpleBoardState;
      } else if (boardType === 'GRAPH') {
        room.state = { nodes: [], edges: [] } satisfies GraphBoardState;
      }
    }
  }

  console.info(
    `[elements] user ${userId} joined board ${boardId} (${boardType}), total in room: ${(await elements.in(boardId).fetchSockets()).length}`,
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  SIMPLE board events
  // ─────────────────────────────────────────────────────────────────────────

  socket.on('addElement', (element: any) => {
    if (room.type !== 'SIMPLE' || !element) return;
    const state = room.state as SimpleBoardState;
    simpleAddElement(state, element);
    markDirty(room);
    // Broadcast to all *other* clients in the room
    socket.to(boardId).emit('elementAdded', element);
  });

  socket.on(
    'updateElement',
    (data: { id: string; newAttrs: Record<string, any> }) => {
      if (room.type !== 'SIMPLE' || !data?.id || !data?.newAttrs) return;
      const state = room.state as SimpleBoardState;
      simpleUpdateElement(state, data.id, data.newAttrs);
      markDirty(room);
      socket.to(boardId).emit('elementUpdated', data);
    },
  );

  socket.on('removeElement', (id: string) => {
    if (room.type !== 'SIMPLE' || !id) return;
    const state = room.state as SimpleBoardState;
    simpleRemoveElement(state, id);
    markDirty(room);
    socket.to(boardId).emit('elementRemoved', id);
  });

  socket.on(
    'changeElementLayer',
    (data: {
      id: string;
      prevPosition: { layer: number; index: number };
      newPosition: { layer: number; index: number };
    }) => {
      if (room.type !== 'SIMPLE' || !data?.id) return;
      const state = room.state as SimpleBoardState;
      simpleChangeElementLayer(
        state,
        data.id,
        data.prevPosition,
        data.newPosition,
      );
      markDirty(room);
      // Note: frontend listens on 'changeElementLayer' (not 'elementMoved')
      socket.to(boardId).emit('changeElementLayer', data);
    },
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  GRAPH board events
  // ─────────────────────────────────────────────────────────────────────────

  socket.on('nodesUpdate', (changes: any[]) => {
    if (room.type !== 'GRAPH' || !Array.isArray(changes)) return;
    const state = room.state as GraphBoardState;
    graphApplyNodeChanges(state, changes);
    markDirty(room);
    socket.to(boardId).emit('nodesUpdate', changes);
  });

  socket.on('edgesUpdate', (changes: any[]) => {
    if (room.type !== 'GRAPH' || !Array.isArray(changes)) return;
    const state = room.state as GraphBoardState;
    graphApplyEdgeChanges(state, changes);
    markDirty(room);
    socket.to(boardId).emit('edgesUpdate', changes);
  });

  socket.on(
    'nodeDataUpdate',
    (payload: {
      nodeId: string;
      newAttrs: Record<string, any>;
      isNew?: boolean;
    }) => {
      if (room.type !== 'GRAPH' || !payload?.nodeId) return;
      const state = room.state as GraphBoardState;
      graphUpdateNodeData(
        state,
        payload.nodeId,
        payload.newAttrs,
        payload.isNew,
      );
      markDirty(room);
      socket.to(boardId).emit('nodeDataUpdate', payload);
    },
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  Disconnect
  // ─────────────────────────────────────────────────────────────────────────

  socket.on('disconnect', async () => {
    console.info(`[elements] user ${userId} left board ${boardId}`);

    // Count remaining sockets in the room (after this one has left)
    const remaining = await elements.in(boardId).fetchSockets();
    if (remaining.length === 0) {
      console.info(`[elements] room ${boardId} is empty — flushing snapshot`);
      await finalFlushAndDelete(room, deleteRoom);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  Namespace: / (root)
//  Used for cursor position broadcasting.
//  Auth: { id, nickname, avatar, color, boardId }
// ─────────────────────────────────────────────────────────────────────────────

const cursors = io.of('/');

cursors.use((socket, next) => {
  const auth = socket.handshake.auth as Partial<CursorClientData>;

  if (!auth.id || !auth.nickname || !auth.color || !auth.boardId) {
    // Allow connection but without joining a board (e.g. healthcheck probes)
    return next();
  }

  (socket as CursorSocket).data = {
    id: auth.id,
    nickname: auth.nickname,
    avatar: auth.avatar ?? '',
    color: auth.color,
    boardId: auth.boardId,
  } satisfies CursorClientData;

  next();
});

cursors.on('connection', (rawSocket) => {
  const socket = rawSocket as CursorSocket;
  const { id, nickname, avatar, color, boardId } = socket.data ?? {};

  if (!boardId) return; // no board → nothing to do

  socket.join(boardId);
  console.info(`[cursors] ${nickname} (${id}) joined board ${boardId}`);

  // ── cursorMove ────────────────────────────────────────────────────────────
  // Frontend sends: { id, nickname, color, x, y }
  // We re-broadcast with avatar added (stored in auth)
  socket.on(
    'cursorMove',
    (data: {
      id: string;
      nickname: string;
      color: string;
      x: number;
      y: number;
    }) => {
      socket.to(boardId).emit('cursorMove', {
        ...data,
        avatar,
        boardId,
      });
    },
  );

  // ── disconnect ────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    console.info(`[cursors] ${nickname} (${id}) left board ${boardId}`);
    socket.to(boardId).emit('userDisconnected', {
      id,
      nickname,
      color,
      boardId,
    });
  });
});

// ─── Boot ─────────────────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.info(`sync_service running on port ${PORT}`);
  console.info(`  CORS origin : ${FRONTEND_ORIGIN}`);
  console.info(`  Backend URL : ${process.env.BACKEND_URI ?? '(not set)'}`);
});

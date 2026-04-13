import { Server as IOServer } from 'socket.io';
import * as Y from 'yjs';
import {
  BoardType,
  DocBoardState,
  ElementsClientData,
  ElementsSocket,
  GraphBoardState,
  SimpleBoardState,
} from '../types';
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
} from '../rooms';
import {
  fetchInitialSnapshot,
  finalFlushAndDelete,
  startSnapshotTimer,
} from '../snapshot';

export function registerElementsNamespace(io: IOServer): void {
  const elements = io.of('/elements');

  elements.use((socket, next) => {
    const { boardId, boardType } = socket.handshake.auth as {
      boardId?: string;
      boardType?: string;
    };
    const userId =
      (socket.handshake.headers['x-user-id'] as string) ?? socket.id;

    if (!boardId) return next(new Error('boardId required'));

    (socket as ElementsSocket).data = {
      boardId,
      userId,
    } satisfies ElementsClientData;

    next();
  });

  elements.on('connection', async (rawSocket) => {
    const socket = rawSocket as ElementsSocket;
    const { boardId, userId } = socket.data;
    const authType = (
      socket.handshake.auth as { boardType?: string }
    ).boardType?.toUpperCase() as BoardType | undefined;
    const boardType: BoardType = authType ?? 'SIMPLE';

    socket.join(boardId);

    const isNew = !getRoom(boardId);
    const room = getOrCreateRoom(boardId, boardType);

    if (isNew) {
      startSnapshotTimer(room);
      const initialState = await fetchInitialSnapshot(boardId);

      // Initializing DOC boards
      if (boardType === 'DOC') {
        room.state = { yDoc: new Y.Doc(), document: [] };
        if (initialState && 'document' in initialState) {
          const docState: DocBoardState = {
            document: initialState.document,
            yDoc: room.state.yDoc,
          };
          if (docState.document && docState.document.length > 0)
            Y.applyUpdate(room.state.yDoc, new Uint8Array(docState.document));
        }
      } else {
        if (initialState) {
          room.state = initialState;
        } else {
          room.state =
            boardType === 'GRAPH'
              ? ({ nodes: [], edges: [] } satisfies GraphBoardState)
              : ({ layers: [[]] } satisfies SimpleBoardState);
        }
      }
    }

    const socketsInRoom = await elements.in(boardId).fetchSockets();

    if (
      boardType === 'DOC' &&
      room.state &&
      'yDoc' in room.state &&
      room.state.yDoc
    ) {
      const syncUpdate = Y.encodeStateAsUpdate(room.state.yDoc);
      socket.emit('docSync', syncUpdate.buffer);
    }

    console.info(
      `[elements] user ${userId} joined board ${boardId} (${boardType}), total: ${socketsInRoom.length}`,
    );

    // SIMPLE
    socket.on('addElement', (element: any) => {
      if (room.type !== 'SIMPLE' || !element) return;
      simpleAddElement(room.state as SimpleBoardState, element);
      markDirty(room);
      socket.to(boardId).emit('elementAdded', element);
    });

    socket.on(
      'updateElement',
      (data: { id: string; newAttrs: Record<string, any> }) => {
        if (room.type !== 'SIMPLE' || !data?.id || !data?.newAttrs) return;
        simpleUpdateElement(
          room.state as SimpleBoardState,
          data.id,
          data.newAttrs,
        );
        markDirty(room);
        socket.to(boardId).emit('elementUpdated', data);
      },
    );

    socket.on('removeElement', (id: string) => {
      if (room.type !== 'SIMPLE' || !id) return;
      simpleRemoveElement(room.state as SimpleBoardState, id);
      markDirty(room);
      socket.to(boardId).emit('elementRemoved', id);
    });

    socket.on('changeElementLayer', (data: any) => {
      if (room.type !== 'SIMPLE' || !data?.id) return;
      simpleChangeElementLayer(
        room.state as SimpleBoardState,
        data.id,
        data.prevPosition,
        data.newPosition,
      );
      markDirty(room);
      socket.to(boardId).emit('changeElementLayer', data);
    });

    // GRAPH
    socket.on('nodesUpdate', (changes: any[]) => {
      if (room.type !== 'GRAPH' || !Array.isArray(changes)) return;
      graphApplyNodeChanges(room.state as GraphBoardState, changes);
      markDirty(room);
      socket.to(boardId).emit('nodesUpdate', changes);
    });

    socket.on('edgesUpdate', (changes: any[]) => {
      if (room.type !== 'GRAPH' || !Array.isArray(changes)) return;
      graphApplyEdgeChanges(room.state as GraphBoardState, changes);
      markDirty(room);
      socket.to(boardId).emit('edgesUpdate', changes);
    });

    socket.on('nodeDataUpdate', (payload: any) => {
      if (room.type !== 'GRAPH' || !payload?.nodeId) return;
      graphUpdateNodeData(
        room.state as GraphBoardState,
        payload.nodeId,
        payload.newAttrs,
        payload.isNew,
      );
      markDirty(room);
      socket.to(boardId).emit('nodeDataUpdate', payload);
    });

    // DOC
    socket.on('docUpdate', (update: ArrayBuffer) => {
      if (room.type !== 'DOC' || !room.state?.yDoc) return;

      Y.applyUpdate(room.state.yDoc, new Uint8Array(update));
      markDirty(room);
      socket.to(boardId).emit('docUpdate', update);
    });

    socket.on('awarenessUpdate', (update: ArrayBuffer) => {
      if (room.type !== 'DOC') return;
      socket.to(boardId).emit('awarenessUpdate', update);
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.info(`[elements] user ${userId} left board ${boardId}`);
      const remaining = await elements.in(boardId).fetchSockets();
      if (remaining.length === 0) {
        console.info(`[elements] room ${boardId} empty - flushing`);
        await finalFlushAndDelete(room, deleteRoom);
      }
    });
  });
}

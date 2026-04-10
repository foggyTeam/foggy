import { Server as IOServer } from 'socket.io';
import {
  BoardType,
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
      if (initialState) {
        room.state = initialState;
      } else {
        room.state =
          boardType === 'GRAPH'
            ? ({ nodes: [], edges: [] } satisfies GraphBoardState)
            : ({ layers: [[]] } satisfies SimpleBoardState);
      }
    }

    const socketsInRoom = await elements.in(boardId).fetchSockets();
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

    socket.on(
      'changeElementLayer',
      (data: {
        id: string;
        prevPosition: { layer: number; index: number };
        newPosition: { layer: number; index: number };
      }) => {
        if (room.type !== 'SIMPLE' || !data?.id) return;
        simpleChangeElementLayer(
          room.state as SimpleBoardState,
          data.id,
          data.prevPosition,
          data.newPosition,
        );
        markDirty(room);
        socket.to(boardId).emit('changeElementLayer', data);
      },
    );

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

    socket.on(
      'nodeDataUpdate',
      (payload: {
        nodeId: string;
        newAttrs: Record<string, any>;
        isNew?: boolean;
      }) => {
        if (room.type !== 'GRAPH' || !payload?.nodeId) return;
        graphUpdateNodeData(
          room.state as GraphBoardState,
          payload.nodeId,
          payload.newAttrs,
          payload.isNew,
        );
        markDirty(room);
        socket.to(boardId).emit('nodeDataUpdate', payload);
      },
    );

    // Disconnect
    socket.on('disconnect', async () => {
      console.info(`[elements] user ${userId} left board ${boardId}`);
      const remaining = await elements.in(boardId).fetchSockets();
      if (remaining.length === 0) {
        console.info(`[elements] room ${boardId} empty — flushing`);
        await finalFlushAndDelete(room, deleteRoom);
      }
    });
  });
}

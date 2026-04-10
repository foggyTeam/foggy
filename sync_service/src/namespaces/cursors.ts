import { Server as IOServer } from 'socket.io';
import { CursorClientData, CursorSocket } from '../types';

export function registerCursorsNamespace(io: IOServer): void {
  const cursors = io.of('/');

  cursors.use((socket, next) => {
    const auth = socket.handshake.auth as Partial<CursorClientData>;
    if (!auth.id || !auth.nickname || !auth.color || !auth.boardId)
      return next();
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
    if (!boardId) return;

    socket.join(boardId);
    console.info(`[cursors] ${nickname} (${id}) joined board ${boardId}`);

    socket.on(
      'cursorMove',
      (data: {
        id: string;
        nickname: string;
        color: string;
        x: number;
        y: number;
      }) => {
        socket.to(boardId).emit('cursorMove', { ...data, avatar, boardId });
      },
    );

    socket.on('disconnect', () => {
      console.info(`[cursors] ${nickname} (${id}) left board ${boardId}`);
      socket
        .to(boardId)
        .emit('userDisconnected', { id, nickname, color, boardId });
    });
  });
}

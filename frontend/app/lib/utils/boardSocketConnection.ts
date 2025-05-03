import io, { Socket } from 'socket.io-client';
import { BoardElement } from '@/app/lib/types/definitions';

export default function openBoardSocketConnection(boardId, userId) {
  const socket = io(`${process.env.NEXT_PUBLIC_API_URI}/elements`, {
    query: {
      boardId,
    },
    extraHeaders: {
      'x-user-id': userId,
    },
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('custom_error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
}

export function socketAddEventListeners(socket: Socket) {
  // addElement
  socket.on('elementAdded', (newElement: BoardElement) =>
    this.addElement(newElement),
  );
  // updateElement
  socket.on(
    'elementUpdated',
    (data: { id: string; newAttrs: Partial<BoardElement> }) =>
      this.updateElement(data.id, data.newAttrs),
  );
  // removeElement
  socket.on('elementRemoved', (id: string) => this.removeElement(id));
  // changeElementLayer
  socket.on(
    'elementMoved',
    (data: { id: string; action: 'back' | 'forward' | 'bottom' | 'top' }) =>
      this.changeElementLayer(data.id, data.action),
  );
}

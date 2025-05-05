import io, { Socket } from 'socket.io-client';
import { BoardElement } from '@/app/lib/types/definitions';
import projectsStore from '@/app/stores/projectsStore';

export default function openBoardSocketConnection(boardId, userId) {
  const socket = io(`${process.env.NEXT_PUBLIC_API_URI}/elements`, {
    auth: {
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
  socket.on('elementAdded', (newElement: BoardElement) => {
    projectsStore.addElement(newElement, true);
  });
  // updateElement
  socket.on('elementUpdated', (newAttrs: Partial<BoardElement>) => {
    console.log(newAttrs, newAttrs.id);
    if (newAttrs.id) projectsStore.updateElement(newAttrs.id, newAttrs, true);
  });
  // removeElement
  socket.on('elementRemoved', (id: string) =>
    projectsStore.removeElement(id, true),
  );
  // changeElementLayer
  socket.on(
    'elementMoved',
    (data: { id: string; action: 'back' | 'forward' | 'bottom' | 'top' }) =>
      projectsStore.changeElementLayer(data.id, data.action, true),
  );
}

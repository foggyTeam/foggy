import io, { Socket } from 'socket.io-client';
import { BoardElement } from '@/app/lib/types/definitions';
import projectsStore from '@/app/stores/projectsStore';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';

export default function openBoardSocketConnection(
  boardId: string,
  userId: string,
) {
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

  socket.on('custom_error', () => {
    addToast({
      color: 'danger',
      severity: 'danger',
      title: settingsStore.t.toasts.socket.socketError.title,
      description: settingsStore.t.toasts.socket.socketError.description,
    });
  });

  socket.on('connect_error', () => {
    addToast({
      color: 'danger',
      severity: 'danger',
      title: settingsStore.t.toasts.socket.socketConnectionError.title,
      description:
        settingsStore.t.toasts.socket.socketConnectionError.description,
    });
  });

  return socket;
}

export function socketAddEventListeners(socket: Socket) {
  // addElement
  socket.on('elementAdded', (newElement: BoardElement) => {
    projectsStore.addElement(newElement, true);
  });
  // updateElement
  socket.on(
    'elementUpdated',
    (data: { id: string; newAttrs: Partial<BoardElement> }) => {
      projectsStore.updateElement(data.id, data.newAttrs, true);
    },
  );
  // removeElement
  socket.on('elementRemoved', (id: string) =>
    projectsStore.removeElement(id, true),
  );
  // changeElementLayer
  socket.on(
    'changeElementLayer',
    (data: {
      id: string;
      prevPosition: { layer: number; index: number };
      newPosition: { layer: number; index: number };
    }) =>
      projectsStore.changeElementLayerSocket(
        data.id,
        data.prevPosition,
        data.newPosition,
      ),
  );
}

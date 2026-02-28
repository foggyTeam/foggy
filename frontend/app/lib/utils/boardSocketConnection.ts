import io, { Socket } from 'socket.io-client';
import { BoardElement, BoardTypes } from '@/app/lib/types/definitions';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import simpleBoardStore from '@/app/stores/board/simpleBoardStore';

const EventsMap: { [key: BoardTypes]: string[] } = {
  SIMPLE: [
    'elementAdded',
    'elementUpdated',
    'elementRemoved',
    'changeElementLayer',
  ],
  GRAPH: [],
  DOC: [],
};

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

export function socketAddEventListeners(socket: Socket, boardType: BoardTypes) {
  switch (boardType) {
    case 'SIMPLE':
      addSimpleBoardListeners(socket);
      break;
  }
}

function addSimpleBoardListeners(socket: Socket) {
  socket.on('elementAdded', (newElement: BoardElement) => {
    simpleBoardStore.addElement(newElement, true);
  });

  socket.on(
    'elementUpdated',
    (data: { id: string; newAttrs: Partial<BoardElement> }) => {
      simpleBoardStore.updateElement(data.id, data.newAttrs, true);
    },
  );

  socket.on('elementRemoved', (id: string) =>
    simpleBoardStore.removeElement(id, true),
  );

  socket.on(
    'changeElementLayer',
    (data: {
      id: string;
      prevPosition: { layer: number; index: number };
      newPosition: { layer: number; index: number };
    }) =>
      simpleBoardStore.changeElementLayerSocket(
        data.id,
        data.prevPosition,
        data.newPosition,
      ),
  );
}

export function socketRemoveEventListeners(
  socket: Socket,
  boardType: BoardTypes,
) {
  for (const event of EventsMap[boardType]) socket.removeAllListeners(event);
}

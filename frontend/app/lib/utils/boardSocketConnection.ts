import io from 'socket.io-client';
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

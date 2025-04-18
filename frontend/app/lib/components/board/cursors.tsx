'use client';
import io from 'socket.io-client';
import { ReactNode, useEffect, useState } from 'react';
import { Chip } from '@heroui/chip';
import { MousePointer2Icon } from 'lucide-react';
import userStore from '@/app/stores/userStore';

export default function Cursors() {
  const [cursors, setCursors] = useState<{
    [key: string]: {
      x: number;
      y: number;
      nickname: string;
      color:
        | 'default'
        | 'danger'
        | 'primary'
        | 'secondary'
        | 'success'
        | 'warning'
        | undefined;
    };
  }>({});
  const colors = ['primary', 'secondary', 'warning', 'success', 'danger'];
  const userColor = colors[Math.floor(Math.random() * colors.length)];

  useEffect(() => {
    const userId = userStore.user?.id;
    const nickname = userStore.user?.name;
    const avatar = userStore.user?.image;

    const socket = io(process.env.NEXT_PUBLIC_API_URI, {
      query: {
        id: userId,
        nickname: nickname,
        avatar: avatar,
        color: userColor,
      },
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      socket.emit('cursorMove', {
        id: userId,
        nickname: nickname,
        color: userColor,
        x: clientX,
        y: clientY,
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    socket.on(
      'cursorMove',
      (data: {
        id: string;
        nickname: string;
        x: number;
        y: number;
        color:
          | 'default'
          | 'danger'
          | 'primary'
          | 'secondary'
          | 'success'
          | 'warning'
          | undefined;
      }) => {
        setCursors((prev) => ({
          ...prev,
          [data.id]: {
            x: data.x,
            y: data.y,
            nickname: data.nickname,
            color: data.color,
          },
        }));
      },
    );

    socket.on('userDisconnected', (data: { id: string }) => {
      setCursors((prev) => {
        const { [data.id]: _, ...rest } = prev;
        return rest;
      });
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      socket.off('cursorMove');
      socket.off('userDisconnected');
      socket.disconnect();
    };
  }, []);

  return (
    <>
      {Object.entries(cursors).map(([id, { x, y, nickname, color }]) => (
        <Chip
          key={id}
          variant="light"
          color={color}
          className="pointer-events-none fixed"
          classNames={{
            base: 'gap-0 p-0 m-0',
            content: 'font-semibold p-0',
          }}
          style={{
            top: y,
            left: x,
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
          }}
          startContent={
            (
              <MousePointer2Icon
                className={`relative -left-0.5 -top-0.5 stroke-${color}-500`}
              />
            ) as ReactNode
          }
        >
          {nickname}
        </Chip>
      ))}
    </>
  );
}

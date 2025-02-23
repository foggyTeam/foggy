'use client';
import io from 'socket.io-client';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Chip } from '@heroui/chip';
import { MousePointer2Icon } from 'lucide-react';
import userStore from '@/app/stores/userStore';

export default function Cursors() {
  const cursorsBoardRef = useRef<HTMLDivElement>(null);
  const [cursors, setCursors] = useState<{
    [key: string]: { x: number; y: number; nickname: string; color: string };
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

    cursorsBoardRef.current?.addEventListener('mousemove', handleMouseMove);

    socket.on(
      'cursorMove',
      (data: {
        id: string;
        nickname: string;
        x: number;
        y: number;
        color: string;
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
      cursorsBoardRef.current?.removeEventListener(
        'mousemove',
        handleMouseMove,
      );
      socket.off('cursorMove');
      socket.off('userDisconnected');
    };
  }, []);

  return (
    <div
      ref={cursorsBoardRef}
      className="absolute z-40 h-full w-full overflow-hidden"
    >
      {Object.entries(cursors).map(([id, { x, y, nickname, color }]) => (
        <Chip
          key={id}
          variant="light"
          color={color}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          classNames={{
            base: 'gap-0 p-0 m-0',
            content: 'font-semibold p-0',
          }}
          style={{
            top: y,
            left: x,
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
    </div>
  );
}

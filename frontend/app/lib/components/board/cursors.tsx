'use client';
import io from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';
import { Chip } from '@heroui/chip';
import { MousePointer2Icon } from 'lucide-react';

const socket = io(process.env.NEXT_PUBLIC_API_URI);

const Cursors = () => {
  const cursorsBoardRef = useRef<HTMLDivElement>(null);
  const [cursors, setCursors] = useState<{
    [key: string]: { x: number; y: number };
  }>({});

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      socket.emit('cursorMove', { x: clientX, y: clientY });
    };

    cursorsBoardRef.current?.addEventListener('mousemove', handleMouseMove);

    socket.on('cursorMove', (data: { id: string; x: number; y: number }) => {
      setCursors((prev) => ({
        ...prev,
        [data.id]: { x: data.x, y: data.y },
      }));
    });

    return () => {
      cursorsBoardRef.current?.removeEventListener(
        'mousemove',
        handleMouseMove,
      );
      socket.off('cursorLeave', (data: { id: string }) => {
        setCursors((prev) => {
          const { [data.id]: _, ...rest } = prev;
          return rest;
        });
      });
    };
  }, []);

  return (
    <div
      ref={cursorsBoardRef}
      className="absolute z-40 h-full w-full overflow-hidden"
    >
      {Object.entries(cursors).map(([id, { x, y }]) => (
        <Chip
          key={id}
          variant="light"
          color="primary"
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
            <MousePointer2Icon className="relative -left-0.5 -top-0.5 stroke-primary-500" />
          }
        >
          {id}
        </Chip>
      ))}
    </div>
  );
};

export default Cursors;

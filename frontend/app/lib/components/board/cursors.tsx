'use client';
import io from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';

const socket = io(process.env.NEXT_PUBLIC_API_URI);

const Cursors = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [cursors, setCursors] = useState<{
    [key: string]: { x: number; y: number; message: string };
  }>({});

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      socket.emit('cursorMove', { x: clientX, y: clientY });
    };

    boardRef.current?.addEventListener('mousemove', handleMouseMove);

    socket.on(
      'cursorMove',
      (data: { id: string; x: number; y: number; message: 'hello' }) => {
        setCursors((prev) => ({
          ...prev,
          [data.id]: { x: data.x, y: data.y, message: data.message },
        }));
      },
    );

    return () => {
      boardRef.current?.removeEventListener('mousemove', handleMouseMove);
      socket.off('cursorMove');
    };
  }, []);

  return (
    <div
      ref={boardRef}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      {Object.entries(cursors).map(([id, { x, y, message }]) => (
        <div
          key={id}
          style={{
            position: 'absolute',
            top: y,
            left: x,
            width: '10px',
            height: '10px',
            background: 'red',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
          }}
        >
          {id}
        </div>
      ))}
    </div>
  );
};

export default Cursors;

'use client';
import io from 'socket.io-client';
import { ReactNode, useEffect, useState } from 'react';
import { Chip } from '@heroui/chip';
import { MousePointer2Icon } from 'lucide-react';
import userStore from '@/app/stores/userStore';
import { useBoardContext } from '@/app/lib/components/board/boardContext';
import throttle from 'lodash/throttle';
import projectsStore from '@/app/stores/projectsStore';
import { observer } from 'mobx-react-lite';

const Cursors = observer(() => {
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
  const { stageRef, scale } = useBoardContext();
  const [forceUpdate, setForceUpdate] = useState(false);

  const getScreenPointerPosition = (
    x: number,
    y: number,
  ): { x: number; y: number } => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const container = stage.container();
    const rect = container.getBoundingClientRect();
    const scale = stage.scaleX();
    const offsetX = stage.x();
    const offsetY = stage.y();
    const screenX = rect.left + (x * scale + offsetX);
    const screenY = rect.top + (y * scale + offsetY);

    return {
      x: screenX,
      y: screenY,
    };
  };

  useEffect(() => {
    if (!projectsStore.activeBoard) return;
    const stage = stageRef.current;
    const userId = userStore.user?.id;
    const nickname = userStore.user?.name;
    const avatar = userStore.user?.image;
    const boardId = projectsStore.activeBoard.id;

    const socket = io(process.env.NEXT_PUBLIC_API_URI, {
      query: {
        id: userId,
        nickname: nickname,
        avatar: avatar,
        color: userColor,
        boardId: boardId,
      },
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    const handleStageChange = () => setForceUpdate((prev) => !prev);
    const handleMouseMove = (event: MouseEvent) => {
      if (event.buttons > 0) handleStageChange();
      const relativePosition = stageRef.current?.getRelativePointerPosition();
      if (relativePosition) {
        const { x, y } = relativePosition;
        socket.emit('cursorMove', {
          id: userId,
          nickname: nickname,
          color: userColor,
          x,
          y,
        });
      }
    };

    const throttledMouseMove = throttle(handleMouseMove, 50);
    const throttledWheel = throttle(handleStageChange, 10);
    document.addEventListener('mousemove', throttledMouseMove);
    stage?.on('wheel', throttledWheel);

    socket.on(
      'cursorMove',
      (data: {
        boardId: string;
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
      document.removeEventListener('mousemove', throttledMouseMove);
      stage?.off('wheel', throttledWheel);
      socket.off('cursorMove');
      socket.off('userDisconnected');
      socket.disconnect();
    };
  }, [stageRef, projectsStore.activeBoard]);

  return (
    <>
      {Object.entries(cursors).map(([id, { x, y, nickname, color }]) => {
        const { x: screenX, y: screenY } = getScreenPointerPosition(x, y);
        return (
          <Chip
            key={id}
            variant="light"
            color={color}
            className="pointer-events-none fixed flex h-fit items-center"
            classNames={{
              base: 'gap-0 p-0 m-0',
              content: 'font-semibold p-0',
            }}
            style={{
              top: screenY,
              left: screenX,
              zIndex: 50,
              transform: `scale(${scale})`,
            }}
            startContent={
              (
                <MousePointer2Icon
                  className={`relative -left-0.5 -top-1 stroke-${color}-500`}
                />
              ) as ReactNode
            }
          >
            {nickname}
          </Chip>
        );
      })}
    </>
  );
});

export default Cursors;

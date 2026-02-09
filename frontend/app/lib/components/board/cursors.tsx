'use client';

import io from 'socket.io-client';
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Chip } from '@heroui/chip';
import { MousePointer2Icon } from 'lucide-react';
import userStore from '@/app/stores/userStore';
import { useBoardContext } from '@/app/lib/components/board/boardContext';
import throttle from 'lodash/throttle';
import projectsStore from '@/app/stores/projectsStore';
import { observer } from 'mobx-react-lite';

type CursorColor =
  | 'default'
  | 'danger'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | undefined;

type CursorData = {
  x: number;
  y: number;
  nickname: string;
  color: CursorColor;
};

const colors: CursorColor[] = [
  'primary',
  'secondary',
  'warning',
  'success',
  'danger',
];

const Cursors = observer(() => {
  const { stageRef, scale, updateCursorsRef } = useBoardContext();

  const [cursorIds, setCursorIds] = useState<string[]>([]);
  const cursorIdsRef = useRef<string[]>([]);
  useEffect(() => {
    cursorIdsRef.current = cursorIds;
  }, [cursorIds]);

  const cursorsRef = useRef<Map<string, CursorData>>(new Map());
  const nodeRef = useRef<Record<string, HTMLDivElement | null>>({});

  const userColor = useMemo(
    () => colors[Math.floor(Math.random() * colors.length)],
    [],
  );

  const redraw = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const container = stage.container();
    const rect = container.getBoundingClientRect();
    const s = stage.scaleX();
    const offsetX = stage.x();
    const offsetY = stage.y();

    for (const id of cursorIdsRef.current) {
      const el = nodeRef.current[id];
      const data = cursorsRef.current.get(id);
      if (!el || !data) continue;

      const screenX = rect.left + (data.x * s + offsetX);
      const screenY = rect.top + (data.y * s + offsetY);

      el.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) scale(${scale})`;
    }
  }, [stageRef, scale]);

  useEffect(() => {
    updateCursorsRef.current = redraw;
    requestAnimationFrame(redraw);

    return () => {
      if (updateCursorsRef.current === redraw) updateCursorsRef.current = null;
    };
  }, [updateCursorsRef, redraw]);

  useEffect(() => {
    const boardId = projectsStore.activeBoard?.id;
    const userId = userStore.user?.id;
    const nickname = userStore.user?.name;
    const avatar = userStore.user?.image;

    if (!boardId || !userId) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URI!, {
      auth: { id: userId, nickname, avatar, color: userColor, boardId },
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    const handleMouseMove = (_: MouseEvent) => {
      const stage = stageRef.current;
      if (!stage) return;

      const relative = stage.getRelativePointerPosition();
      if (!relative) return;

      socket.emit('cursorMove', {
        id: userId,
        nickname,
        color: userColor,
        x: relative.x,
        y: relative.y,
      });
    };

    const throttledMouseMove = throttle(handleMouseMove, 50);
    document.addEventListener('mousemove', throttledMouseMove);

    socket.on(
      'cursorMove',
      (data: {
        id: string;
        nickname: string;
        x: number;
        y: number;
        color: CursorColor;
      }) => {
        cursorsRef.current.set(data.id, {
          x: data.x,
          y: data.y,
          nickname: data.nickname,
          color: data.color,
        });

        setCursorIds((prev) => {
          if (prev.includes(data.id)) {
            redraw();
            return prev;
          }

          const next = [...prev, data.id];
          requestAnimationFrame(redraw);
          return next;
        });

        redraw();
      },
    );

    socket.on('userDisconnected', (data: { id: string }) => {
      cursorsRef.current.delete(data.id);
      nodeRef.current[data.id] = null;

      setCursorIds((prev) => prev.filter((id) => id !== data.id));

      requestAnimationFrame(redraw);
    });

    return () => {
      document.removeEventListener('mousemove', throttledMouseMove);
      throttledMouseMove.cancel();

      socket.off('cursorMove');
      socket.off('userDisconnected');
      socket.disconnect();
    };
  }, [projectsStore.activeBoard?.id, stageRef, userColor, redraw]);

  return (
    <>
      {cursorIds.map((id) => {
        const data = cursorsRef.current.get(id);
        if (!data) return null;

        return (
          <div
            key={id}
            ref={(el) => {
              nodeRef.current[id] = el;
              if (el) requestAnimationFrame(redraw);
            }}
            className="pointer-events-none fixed top-0 left-0 z-50"
          >
            <Chip
              variant="light"
              color={data.color}
              className="pointer-events-none flex h-fit items-center"
              classNames={{
                base: 'gap-0 p-0 m-0',
                content: 'font-semibold p-0',
              }}
              startContent={
                (
                  <MousePointer2Icon
                    className={`relative -top-1 -left-0.5 stroke-${data.color}-500`}
                  />
                ) as ReactNode
              }
            >
              {data.nickname}
            </Chip>
          </div>
        );
      })}
    </>
  );
});

export default Cursors;

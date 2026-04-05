'use client';

import io from 'socket.io-client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import userStore from '@/app/stores/userStore';
import { useBoardContext } from '@/app/lib/components/board/simple/boardContext';
import throttle from 'lodash/throttle';
import { observer } from 'mobx-react-lite';
import boardStore from '@/app/stores/board/boardStore';
import CursorChip, {
  CursorColor,
  cursorColors,
} from '@/app/lib/components/board/cursorChip';

type CursorData = {
  x: number;
  y: number;
  nickname: string;
  color: CursorColor;
};

const Cursors = observer(() => {
  const { stageRef, updateCursorsRef } = useBoardContext();

  const [cursorIds, setCursorIds] = useState<string[]>([]);
  const cursorIdsRef = useRef<string[]>([]);

  useEffect(() => {
    cursorIdsRef.current = cursorIds;
  }, [cursorIds]);

  const cursorsRef = useRef<Map<string, CursorData>>(new Map());
  const nodeRef = useRef<Record<string, HTMLDivElement | null>>({});

  const userColor = useMemo(
    () => cursorColors[Math.floor(Math.random() * cursorColors.length)],
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

      el.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) scale(${s})`;
    }
  }, [stageRef]);

  useEffect(() => {
    updateCursorsRef.current = redraw;
    requestAnimationFrame(redraw);

    return () => {
      if (updateCursorsRef.current === redraw) updateCursorsRef.current = null;
    };
  }, [updateCursorsRef, redraw]);

  useEffect(() => {
    const boardId = boardStore.activeBoard?.id;
    const userId = userStore.user?.id;
    const nickname = userStore.user?.name;
    const avatar = userStore.user?.image;

    if (!boardId || !userId) return;

    const socket = io(process.env.NEXT_PUBLIC_SYNC_URI!, {
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
  }, [boardStore.activeBoard?.id, stageRef, userColor, redraw]);

  return (
    <>
      {cursorIds.map((id) => {
        const data = cursorsRef.current.get(id);
        if (!data) return null;

        return (
          <CursorChip
            key={id}
            ref={(el: HTMLDivElement | null) => {
              nodeRef.current[id] = el;
              if (el) requestAnimationFrame(redraw);
            }}
            color={data.color}
            nickname={data.nickname}
          />
        );
      })}
    </>
  );
});

export default Cursors;

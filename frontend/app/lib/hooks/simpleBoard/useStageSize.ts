'use client';

import { RefObject, useLayoutEffect, useState } from 'react';

export default function useStageContainerSize<T extends HTMLElement>(
  stageRef: RefObject<T | null>,
) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const update = () => {
      const container = stage.getBoundingClientRect();
      setSize({
        width: Math.max(0, Math.round(container.width)),
        height: Math.max(0, Math.round(container.height)),
      });
    };

    update();

    const resizeObserver = new ResizeObserver(() => update());
    resizeObserver.observe(stage);

    return () => resizeObserver.disconnect();
  }, [stageRef]);

  return size;
}

'use client';

import React, { useEffect, useRef } from 'react';
import Cursors from '@/app/lib/components/board/simple/cursors';
import {
  BoardContext,
  BoardProvider,
} from '@/app/lib/components/board/simple/boardContext';
import BoardStage from '@/app/lib/components/board/simple/boardStage';
import settingsStore from '@/app/stores/settingsStore';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

import Konva from 'konva';
import BoardImageGenerator from '@/app/lib/components/board/simple/ai/boardImageGenerator';

export default function BoardClientWrapper() {
  const { isMobile } = useAdaptiveParams();
  const appliedRef = useRef<number | null>(null);

  useEffect(() => {
    settingsStore.endLoading();
  }, []);

  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    const next = isMobile ? Math.min(dpr, 1.5) : dpr;

    if (appliedRef.current === next) return;
    appliedRef.current = next;

    try {
      Konva.pixelRatio = next;
    } catch {}
  }, [isMobile]);

  return (
    <BoardProvider>
      <BoardStage />
      <Cursors />
      <BoardContext.Consumer>
        {(context) => (
          <BoardImageGenerator
            boardData={{ type: 'SIMPLE', data: context!.stageRef }}
          />
        )}
      </BoardContext.Consumer>
    </BoardProvider>
  );
}

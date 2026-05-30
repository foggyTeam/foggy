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
import BoardImageGenerator from '@/app/lib/components/board/ai/boardImageGenerator';
import AiAssistantButton from '@/app/lib/components/board/ai/aiAssistantButton';
import simpleBoardStore from '@/app/stores/board/simpleBoardStore';

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (isCmdOrCtrl) {
        if (key === 'z') {
          e.preventDefault();
          if (e.shiftKey) simpleBoardStore.redo();
          else simpleBoardStore.undo();
        } else if (key === 'y') {
          e.preventDefault();
          simpleBoardStore.redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <BoardProvider>
      <BoardStage />
      <Cursors />
      <BoardContext.Consumer>
        {(context) => (
          <>
            <BoardImageGenerator
              boardData={{ type: 'SIMPLE', data: context!.stageRef }}
            />
            <AiAssistantButton
              boardData={{ type: 'SIMPLE', data: context!.stageRef }}
              addElementAction={context!.addElement}
            />
          </>
        )}
      </BoardContext.Consumer>
    </BoardProvider>
  );
}

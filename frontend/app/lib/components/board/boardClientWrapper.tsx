'use client';

import React, { useEffect } from 'react';
import Cursors from '@/app/lib/components/board/cursors';
import { BoardProvider } from '@/app/lib/components/board/boardContext';
import BoardStage from '@/app/lib/components/board/boardStage';
import settingsStore from '@/app/stores/settingsStore';

export default function BoardClientWrapper() {
  useEffect(() => {
    settingsStore.endLoading();
  }, []);

  return (
    <BoardProvider>
      <BoardStage />
      <Cursors />
    </BoardProvider>
  );
}

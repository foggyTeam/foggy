'use client';

import React from 'react';
import Cursors from '@/app/lib/components/board/cursors';
import { BoardProvider } from '@/app/lib/components/board/boardContext';
import BoardStage from '@/app/lib/components/board/boardStage';

export default function BoardClientWrapper() {
  return (
    <BoardProvider>
      <BoardStage />
      <Cursors />
    </BoardProvider>
  );
}

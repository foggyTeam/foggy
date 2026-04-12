'use client';

import { useEffect } from 'react';
import settingsStore from '@/app/stores/settingsStore';
import DocBoard from '@/app/lib/components/board/doc/docBoard';
import { DocBoardProvider } from '@/app/lib/components/board/doc/docBoardContext';

export default function DocBoardClientWrapper() {
  useEffect(() => {
    settingsStore.endLoading();
  }, []);

  return (
    <DocBoardProvider>
      <DocBoard />
    </DocBoardProvider>
  );
}

'use client';

import { useEffect } from 'react';
import settingsStore from '@/app/stores/settingsStore';
import DocBoard from '@/app/lib/components/board/doc/docBoard';

export default function DocBoardClientWrapper() {
  useEffect(() => {
    settingsStore.endLoading();
  }, []);

  return <DocBoard />;
}

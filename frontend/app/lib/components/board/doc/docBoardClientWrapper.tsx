'use client';

import { useEffect } from 'react';
import settingsStore from '@/app/stores/settingsStore';
import DocBoard from '@/app/lib/components/board/doc/docBoard';
import { DocBoardProvider } from '@/app/lib/components/board/doc/docBoardContext';
import docBoardStore from '@/app/stores/board/docBoardStore';
import { observer } from 'mobx-react-lite';
import AiAssistantButton from '@/app/lib/components/board/ai/aiAssistantButton';

const DocBoardClientWrapper = observer(() => {
  const isReady =
    docBoardStore.yText !== null && docBoardStore.awareness !== null;
  useEffect(() => {
    if (isReady) settingsStore.endLoading();
  }, [isReady]);
  if (!isReady) return null;

  return (
    <DocBoardProvider>
      <AiAssistantButton />
      <DocBoard />
    </DocBoardProvider>
  );
});

export default DocBoardClientWrapper;

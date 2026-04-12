'use client';

import 'quill/dist/quill.core.css';
import '@/app/lib/components/board/simple/tools/textEditor/quillOverrides.css';
import TextEditorToolBar from '@/app/lib/components/board/simple/tools/textEditor/textEditorToolBar';
import React from 'react';
import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
import VirtualizedPage from '@/app/lib/components/board/doc/virtualizedPage';
import { useDocBoardContext } from '@/app/lib/components/board/doc/docBoardContext';

export default function DocBoard() {
  const {
    activeQuillRef,
    selectionFormat,
    setSelectionFormat,
    saveSelection,
    restoreSelection,
  } = useDocBoardContext();

  return (
    <>
      <TextEditorToolBar
        selectionFormat={selectionFormat}
        setSelectionFormat={setSelectionFormat}
        quillRef={activeQuillRef}
        saveSelection={saveSelection}
        restoreSelection={restoreSelection}
      />
      <div
        className={clsx(
          bg_container,
          'flex h-full w-full overflow-hidden sm:px-8',
        )}
      >
        <VirtualizedPage />
      </div>
    </>
  );
}

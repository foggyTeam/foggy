'use client';

import 'quill/dist/quill.core.css';
import '@/app/lib/components/board/simple/tools/textEditor/quillOverrides.css';
import TextEditorToolBar from '@/app/lib/components/board/simple/tools/textEditor/textEditorToolBar';
import React from 'react';
import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
import { useDocBoardContext } from '@/app/lib/components/board/doc/docBoardContext';
import { ScrollShadow } from '@heroui/scroll-shadow';
import QuillContainer from '@/app/lib/components/board/doc/quillContainer';
import projectsStore from '@/app/stores/projectsStore';
import { CircularProgress } from '@heroui/progress';

export default function DocBoard() {
  const {
    activeQuillRef,
    selectionFormat,
    setSelectionFormat,
    saveSelection,
    restoreSelection,
    isLoading,
  } = useDocBoardContext();

  return (
    <>
      {projectsStore.myRole !== 'reader' && (
        <TextEditorToolBar
          selectionFormat={selectionFormat}
          setSelectionFormat={setSelectionFormat}
          quillRef={activeQuillRef}
          saveSelection={saveSelection}
          restoreSelection={restoreSelection}
          isExtended
        />
      )}
      <div
        className={clsx(
          bg_container,
          'relative flex h-full w-full overflow-hidden sm:px-8',
        )}
      >
        {isLoading && (
          <CircularProgress
            className="absolute top-1/2 left-1/2 z-50 h-72 w-72 -translate-x-1/2 -translate-y-1/2"
            size="lg"
            aria-label="Loading..."
          />
        )}

        <ScrollShadow
          inert={isLoading}
          className={clsx(
            'h-full w-full overflow-y-auto transition-opacity',
            isLoading
              ? 'pointer-events-none opacity-25'
              : 'pointer-events-auto opacity-100',
          )}
        >
          <div className="relative flex min-h-full flex-col pb-8">
            <QuillContainer />
          </div>
        </ScrollShadow>
      </div>
    </>
  );
}

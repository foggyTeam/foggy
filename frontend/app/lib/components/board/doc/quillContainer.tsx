'use client';

import 'quill/dist/quill.core.css';
import '@/app/lib/components/board/simple/tools/textEditor/quillOverrides.css';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import { useEffect, useRef } from 'react';
import settingsStore from '@/app/stores/settingsStore';
import { useDocBoardContext } from '@/app/lib/components/board/doc/docBoardContext';
import docBoardStore from '@/app/stores/board/docBoardStore';
import { QuillBinding } from 'y-quill';

Quill.register('modules/cursors', QuillCursors);

export default function QuillContainer() {
  const editorContainerRef = useRef<HTMLDivElement>(null as any);
  const bindingRef = useRef<QuillBinding | null>(null);

  const { activeQuillRef, onSelectionChange } = useDocBoardContext();

  useEffect(() => {
    if (editorContainerRef.current) {
      if (docBoardStore.yText === null || docBoardStore.awareness === null)
        return;

      const quill = new Quill(editorContainerRef.current, {
        theme: 'snow',
        modules: {
          toolbar: false,
          cursors: true,
        },
        placeholder: settingsStore.t.toolBar.textToolPlaceholder,
      });

      activeQuillRef.current = quill;

      bindingRef.current = new QuillBinding(
        docBoardStore.yText,
        quill,
        docBoardStore.awareness,
      );

      quill.on('selection-change', onSelectionChange);
    }
    return () => {
      bindingRef.current?.destroy();
      bindingRef.current = null;

      activeQuillRef.current?.off('selection-change');
      activeQuillRef.current = null;
      if (editorContainerRef.current) editorContainerRef.current.innerHTML = '';
    };
  }, []);

  return (
    <div
      ref={editorContainerRef}
      className="caret-f_accent flex w-full flex-1 flex-col p-0 [&>.ql-editor]:flex-1"
    />
  );
}

'use client';

import 'quill/dist/quill.core.css';
import '@/app/lib/components/board/simple/tools/textEditor/quillOverrides.css';
import { useEffect, useRef, useState } from 'react';
import settingsStore from '@/app/stores/settingsStore';
import { useDocBoardContext } from '@/app/lib/components/board/doc/docBoardContext';

export default function QuillContainer() {
  const editorContainerRef = useRef<HTMLDivElement>(null as any);
  const [content, setContent] = useState('');

  const { activeQuillRef, setSelectionFormat } = useDocBoardContext();

  useEffect(() => {
    if (editorContainerRef.current) {
      editorContainerRef.current.innerHTML = content || '';

      import('quill').then((QuillModule) => {
        const Quill = QuillModule.default ?? QuillModule;

        const quill = new Quill(editorContainerRef.current, {
          theme: 'snow',
          modules: {
            toolbar: false,
          },
          placeholder: settingsStore.t.toolBar.textToolPlaceholder,
        });

        activeQuillRef.current = quill;

        quill.on('selection-change', () => {
          if (quill.getSelection()) {
            const format = quill.getFormat();
            setSelectionFormat(format);
          }
        });

        quill.on('text-change', () => {
          const content = quill.root.innerHTML;
          setContent(content);
        });
      });
    }
    return () => {
      activeQuillRef.current?.off('selection-change');
      activeQuillRef.current?.off('text-change');
      activeQuillRef.current = null;
      if (editorContainerRef.current) {
        editorContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div
      ref={editorContainerRef}
      className="caret-f_accent flex w-full flex-1 flex-col p-0 [&>.ql-editor]:flex-1"
    />
  );
}

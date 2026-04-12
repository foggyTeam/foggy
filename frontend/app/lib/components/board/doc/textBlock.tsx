'use client';

import 'quill/dist/quill.core.css';
import '@/app/lib/components/board/simple/tools/textEditor/quillOverrides.css';
import { useEffect, useRef, useState } from 'react';
import settingsStore from '@/app/stores/settingsStore';
import { useDocBoardContext } from '@/app/lib/components/board/doc/docBoardContext';
import QuillType from 'quill';

interface Props {
  block: any;
}

export default function DocBlock({ block }: Props) {
  const quillRef = useRef<QuillType | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null as any);
  const [content, setContent] = useState(`${block.id} ${block.type}`);

  const { activeQuillRef, setSelectionFormat } = useDocBoardContext();

  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.innerHTML = content || '';

      import('quill').then((QuillModule) => {
        const Quill = QuillModule.default ?? QuillModule;

        const quill = new Quill(editorContainerRef.current, {
          theme: 'snow',
          modules: {
            toolbar: false,
          },
          placeholder: settingsStore.t.toolBar.textToolPlaceholder,
        });

        quillRef.current = quill;

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
  }, [setContent]);

  function handleFocus() {
    console.log('focus');
    activeQuillRef.current = quillRef.current;
  }

  return (
    <div
      onFocus={handleFocus}
      ref={editorContainerRef}
      className="quill-editor-container caret-f_accent h-fit min-h-[32px] w-full"
    />
  );
}

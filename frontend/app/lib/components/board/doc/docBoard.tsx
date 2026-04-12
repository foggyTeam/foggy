'use client';

import 'quill/dist/quill.core.css';
import '@/app/lib/components/board/simple/tools/textEditor/quillOverrides.css';
import type QuillType from 'quill';
import { observer } from 'mobx-react-lite';
import TextEditorToolBar from '@/app/lib/components/board/simple/tools/textEditor/textEditorToolBar';
import React, { useEffect, useRef, useState } from 'react';
import settingsStore from '@/app/stores/settingsStore';
import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';

const DocBoard = observer(() => {
  const quillRef = useRef<QuillType | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null as any);
  const [content, setContent] = useState('');

  const [selectionFormat, setSelectionFormat] = useState({} as any);
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);

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

  const saveSelection = () => {
    const quill = quillRef.current;
    if (quill) {
      const range: any = quill.getSelection();
      setSavedSelection(range);
    }
  };

  const restoreSelection = () => {
    const quill = quillRef.current;
    if (quill && savedSelection) {
      requestAnimationFrame(() => quill.setSelection(savedSelection as any));
    }
  };

  return (
    <>
      <TextEditorToolBar
        selectionFormat={selectionFormat}
        setSelectionFormat={setSelectionFormat}
        quillRef={quillRef}
        saveSelection={saveSelection}
        restoreSelection={restoreSelection}
      />
      <div
        className={clsx(
          bg_container,
          'flex h-full w-full flex-col items-start justify-start gap-1 overflow-hidden',
        )}
      >
        <div
          ref={editorContainerRef}
          className="quill-editor-container caret-f_accent w-full p-0"
        />
      </div>
    </>
  );
});

export default DocBoard;

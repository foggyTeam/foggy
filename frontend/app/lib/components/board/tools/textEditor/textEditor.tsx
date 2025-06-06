'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.core.css';
import '@/app/lib/components/board/tools/textEditor/quillOverrides.css';
import settingsStore from '@/app/stores/settingsStore';
import TextEditorToolBar from '@/app/lib/components/board/tools/textEditor/textEditorToolBar';
import type QuillType from 'quill';

export default function CustomTextEditor({
  top,
  left,
  content,
  setContent,
  height,
  setHeight,
  width,
}: {
  top?: number;
  left?: number;
  content: string;
  setContent: any;
  height?: number;
  setHeight: any;
  width?: number;
}) {
  const quillRef = useRef<QuillType | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null as any);

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
          setHeight(editorContainerRef.current?.clientHeight);
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
    <div
      style={{
        position: 'fixed',
        top: top ? top - 56 : 0,
        left: left ? left : 0,
      }}
    >
      <TextEditorToolBar
        selectionFormat={selectionFormat}
        setSelectionFormat={setSelectionFormat}
        quillRef={quillRef}
        saveSelection={saveSelection}
        restoreSelection={restoreSelection}
      />
      <div
        style={{
          width: width ? `${width}px` : '',
          height: height ? `${height}px` : '',
        }}
        ref={editorContainerRef}
        className="quill-editor-container max-w-[27rem] caret-f_accent"
      />
    </div>
  );
}

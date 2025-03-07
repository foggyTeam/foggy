import React, { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.core.css';
import '@/app/lib/components/board/tools/textEditor/quillOverrides.css';
import Quill from 'quill';
import settingsStore from '@/app/stores/settingsStore';
import TextEditorToolBar from '@/app/lib/components/board/tools/textEditor/textEditorToolBar';

export default function CustomTextEditor({ top, left, content, setContent }) {
  const quillRef = useRef<Quill | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null as any);

  const [selectionFormat, setSelectionFormat] = useState({} as any);

  useEffect(() => {
    if (editorContainerRef.current) {
      editorContainerRef.current.innerHTML = content || '';

      const quill: Quill = new Quill(editorContainerRef.current, {
        theme: 'snow',
        modules: {
          toolbar: false,
        },
        placeholder: settingsStore.t.toolBar.textToolPlaceholder,
      });

      quillRef.current = quill;

      quill.on('selection-change', () => {
        const format = quill.getFormat();
        setSelectionFormat(format);
      });

      quill.on('text-change', () => {
        const content = quill.root.innerHTML; // Получаем HTML содержимое
        setContent(content);
      });
    }
  }, [setContent]);

  return (
    <div
      style={{
        position: 'fixed',
        top: top - 65.33 - 16,
        left: left - 16,
      }}
      className="max-w-96"
    >
      <TextEditorToolBar
        selectionFormat={selectionFormat}
        setSelectionFormat={setSelectionFormat}
        quillRef={quillRef}
      />
      <div ref={editorContainerRef} className="quill-editor-container" />
    </div>
  );
}

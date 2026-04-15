'use client';

import 'quill/dist/quill.core.css';
import '@/app/lib/components/board/simple/tools/textEditor/quillOverrides.css';
import '@/app/lib/components/board/doc/docBoardCursors.css';
import { useEffect, useRef } from 'react';
import settingsStore from '@/app/stores/settingsStore';
import { useDocBoardContext } from '@/app/lib/components/board/doc/docBoardContext';
import docBoardStore from '@/app/stores/board/docBoardStore';
import { QuillBinding } from 'y-quill';
import { addToast } from '@heroui/toast';
import projectsStore from '@/app/stores/projectsStore';
import handleQuillPaste from '@/app/lib/utils/handleQuillPaste';
import { deleteImage } from '@/app/lib/server/actions/handleImage';

export default function QuillContainer() {
  const editorContainerRef = useRef<HTMLDivElement>(null as any);
  const bindingRef = useRef<QuillBinding | null>(null);

  const quillUser = useRef<string | null>(null);
  const { activeQuillRef, onSelectionChange, setIsLoading } =
    useDocBoardContext();

  const onPaste = (e: ClipboardEvent) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData || activeQuillRef.current === null) return;

    const html = clipboardData.getData('text/html');
    const text = clipboardData.getData('text/plain');

    const files: File[] = [];
    if (clipboardData.items) {
      for (let i = 0; i < clipboardData.items.length; i++) {
        if (clipboardData.items[i].type.startsWith('image/')) {
          const file = clipboardData.items[i].getAsFile();
          if (file) files.push(file);
        }
      }
    }

    const htmlHasImages =
      html && (html.includes('<img') || html.includes('data:image/'));

    if (files.length > 0 || (text && !html) || htmlHasImages) {
      e.preventDefault();
      e.stopPropagation();

      setIsLoading(true);
      handleQuillPaste(activeQuillRef.current, files, html, text).finally(() =>
        setIsLoading(false),
      );
    }
  };

  async function onTextChange(delta: any, oldDelta: any, source: string) {
    if (activeQuillRef.current === null || source !== quillUser.current) return;

    const deletedOps = delta.ops.filter((op: any) => op.delete);

    if (deletedOps.length > 0) {
      const deletedDelta = activeQuillRef.current.getContents().diff(oldDelta);

      await Promise.all(
        deletedDelta.ops.map((op) => {
          if (op.insert && typeof op.insert === 'object' && op.insert.image) {
            const deletedImageUrl = op.insert.image.toString();
            return deleteImage(deletedImageUrl);
          }
          return null;
        }),
      );
    }
  }

  async function initializeQuill() {
    if (docBoardStore.yText === null || docBoardStore.awareness === null)
      return;

    setIsLoading(true);
    try {
      const QuillModule = await import('quill');
      const QuillCursorsModule = await import('quill-cursors');

      const Quill = QuillModule.default ?? QuillModule;
      const QuillCursors = QuillCursorsModule.default ?? QuillCursorsModule;
      const BlockEmbed = Quill.import('blots/block/embed') as any;

      class DividerBlot extends BlockEmbed {
        static blotName = 'divider';
        static tagName = 'hr';

        static create(value: any) {
          return super.create(value);
        }
      }

      Quill.register('modules/cursors', QuillCursors);
      Quill.register(DividerBlot as any);

      const quill = new Quill(editorContainerRef.current, {
        theme: 'snow',
        modules: {
          toolbar: false,
          cursors: true,
          table: true,
          clipboard: true,
        },
        placeholder: settingsStore.t.toolBar.textToolPlaceholder,
      });

      activeQuillRef.current = quill;

      bindingRef.current = new QuillBinding(
        docBoardStore.yText,
        quill,
        docBoardStore.awareness!,
      );

      if (projectsStore.myRole === 'reader') quill.disable();

      quillUser.current = Quill.sources.USER;

      quill.clipboard.addMatcher('IMG', (node, delta) => delta);

      quill.root.addEventListener('paste', onPaste, {
        capture: true,
      });
      quill.on('selection-change', onSelectionChange);
      quill.on('text-change', onTextChange);
    } catch (e: any) {
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.board.quillError,
      });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (editorContainerRef.current) initializeQuill();

    return () => {
      bindingRef.current?.destroy();
      bindingRef.current = null;
      activeQuillRef.current?.root.removeEventListener('paste', onPaste);
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
      className="caret-f_accent flex w-full flex-1 flex-col px-0.5 !py-2 [&>.ql-editor]:flex-1"
    />
  );
}

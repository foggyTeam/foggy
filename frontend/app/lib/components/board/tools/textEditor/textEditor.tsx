import React from 'react';
import ReactQuill from 'react-quill-new';
import settingsStore from '@/app/stores/settingsStore';
import TextEditorToolBar from '@/app/lib/components/board/tools/textEditor/textEditorToolBar';

const quillModules = {
  toolbar: {
    container: '#toolbar',
    handlers: {
      // Добавьте свои обработчики, если необходимо
    },
    /*
    * ['bold', 'italic', 'underline', 'strike', 'blockquote', 'link'],
    [{ header: [1, 2, 3, false] }],
    [{ color: [] }, { background: [] }, { font: [montserrat] }],
    [{ align: [] }, { list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
    ['clean'],
    * */
  },
};

const quillFormats = [
  'header',
  'font',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'check',
  'link',
  'color',
  'background',
  'align',
];

export default function CustomTextEditor({ top, left, content, setContent }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: top - 42.52,
        left: left,
      }}
    >
      <TextEditorToolBar />
      <ReactQuill
        value={content}
        onChange={setContent}
        modules={quillModules}
        formats={quillFormats}
        placeholder={settingsStore.t.toolBar.textToolPlaceholder}
        className="max-w-96"
      />
    </div>
  );
}

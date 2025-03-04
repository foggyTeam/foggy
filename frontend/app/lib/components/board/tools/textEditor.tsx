import settingsStore from '@/app/stores/settingsStore';
import ReactQuill from 'react-quill-new';
import { montserrat } from '@/public/fonts/fonts';

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike', 'blockquote', 'link'],
    [{ header: [1, 2, 3, false] }],
    [{ color: [] }, { background: [] }, { font: [montserrat] }],
    [{ align: [] }, { list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
    ['clean'],
  ],
};

export default function TextEditor({ top, left, content, setContent }) {
  return (
    <ReactQuill
      value={content}
      onChange={setContent}
      modules={quillModules}
      placeholder={settingsStore.t.toolBar.textToolPlaceholder}
      style={
        {
          position: 'fixed',
          top: top - 42.52,
          left: left,
        } as any
      }
      theme="snow"
      className="max-w-96"
    />
  );
}

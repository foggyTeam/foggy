import ColorPicker from '@/app/lib/components/board/tools/colorPicker';
import { useState } from 'react';
import { primary } from '@/tailwind.config';

/* TODO:
Bold: ql-bold
Italic: ql-italic
Underline: ql-underline
Strike: ql-strike
Blockquote: ql-blockquote
Link: ql-link
Header: ql-header (включая уровни заголовков: ql-header-1, ql-header-2, и т.д.)
Color: ql-color
Background: ql-background
Font: ql-font
Align: ql-align
List (ordered): ql-list с атрибутом value="ordered"
List (bullet): ql-list с атрибутом value="bullet"
List (check): ql-list с атрибутом value="check"
Clean: ql-clean
*/

export default function TextEditorToolBar() {
  const [color, setColor] = useState(primary.DEFAULT);

  return (
    <div id="toolbar">
      <select className="ql-font">
        <option value="sans-serif" selected>
          Sans Serif
        </option>
        <option value="serif">Serif</option>
        <option value="monospace">Monospace</option>
        <option value="Montserrat">Montserrat</option>
      </select>
      <button className="ql-bold">
        <svg viewBox="0 0 18 18">
          <path d="M7.5 4.5v9h-1v-9h1zM2 2h14v14H2V2z" />
        </svg>
      </button>
      <button className="ql-italic">
        <svg viewBox="0 0 18 18">
          <path d="M7.5 4.5v9h-1v-9h1zM2 2h14v14H2V2z" />
        </svg>
      </button>
      <ColorPicker color={color} changeColor={setColor} />
    </div>
  );
}

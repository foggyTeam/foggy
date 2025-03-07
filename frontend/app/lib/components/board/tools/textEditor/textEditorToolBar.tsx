import React, { JSX } from 'react';
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BaselineIcon,
  BoldIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  LinkIcon,
  ListChecksIcon,
  ListIcon,
  ListOrderedIcon,
  PaintBucketIcon,
  QuoteIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from 'lucide-react';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import Quill from 'quill';
import clsx from 'clsx';
import { Divider } from '@heroui/divider';
import EditorToolButton from '@/app/lib/components/board/tools/textEditor/editorToolButton';

interface EditorTool {
  id?: string;
  value: string | boolean | number;
  ToolIcon: JSX.Element;
}

interface EditorDropdown {
  id: string;
  options: EditorTool[];
}

export default function TextEditorToolBar({
  selectionFormat,
  setSelectionFormat,
  quillRef,
}) {
  const defaultLink = '/';
  const defaultColor = '#171717';
  const defaultBackground = '';

  const tools: {
    base: EditorTool[];
    link: EditorTool;
    color: EditorTool[];
    dropdown: EditorDropdown[];
  } = {
    base: [
      { id: 'bold', value: true, ToolIcon: BoldIcon },
      { id: 'italic', value: true, ToolIcon: ItalicIcon },
      { id: 'underline', value: true, ToolIcon: UnderlineIcon },
      { id: 'strike', value: true, ToolIcon: StrikethroughIcon },
      { id: 'blockquote', value: true, ToolIcon: QuoteIcon },
    ] as EditorTool[],
    link: { id: 'link', value: defaultLink, ToolIcon: LinkIcon } as EditorTool,
    color: [
      { id: 'color', value: defaultColor, ToolIcon: BaselineIcon },
      { id: 'background', value: defaultBackground, ToolIcon: PaintBucketIcon },
    ] as EditorTool[],
    dropdown: [
      {
        id: 'header',
        options: [
          { value: 1, ToolIcon: Heading1Icon },
          { value: 2, ToolIcon: Heading2Icon },
          { value: 3, ToolIcon: Heading3Icon },
        ],
      },
      {
        id: 'list',
        options: [
          { value: 'bullet', ToolIcon: ListIcon },
          { value: 'ordered', ToolIcon: ListOrderedIcon },
          { value: 'check', ToolIcon: ListChecksIcon },
        ],
      },
      {
        id: 'align',
        options: [
          { value: 'center', ToolIcon: AlignCenterIcon },
          { value: 'justify', ToolIcon: AlignJustifyIcon },
          { value: 'left', ToolIcon: AlignLeftIcon },
          { value: 'right', ToolIcon: AlignRightIcon },
        ],
      },
    ] as EditorDropdown[],
  };

  function handleClick(clickType, value) {
    if (quillRef.current) {
      // получим и обновим данные о выделенном фрагменте из Quill
      const quill = quillRef.current as Quill;
      const currentValue = quill.getFormat()[clickType];
      const newFormat = value == currentValue ? false : value;

      quill.format(clickType, newFormat);

      // обновим собственные данные на основе данных Quill
      setSelectionFormat({
        ...selectionFormat,
        [clickType]: newFormat,
      });
    }
  }

  return (
    <div
      className={clsx(
        bg_container_no_padding,
        'flex h-14 w-full justify-start gap-1 p-2 sm:p-3',
      )}
    >
      {tools.base.map((tool, index) => {
        return (
          <EditorToolButton
            id={tool.id}
            value={tool.value}
            handleClick={handleClick}
            Icon={tool.ToolIcon}
            isAccent={selectionFormat[tool.id] === tool.value}
            index={index}
            key={`${tool.id}${index}`}
          />
        );
      })}
      <Divider key={`base`} orientation={`vertical`} />

      <EditorToolButton
        id={tools.link.id}
        value={defaultLink}
        Icon={tools.link.ToolIcon}
        handleClick={handleClick}
        isAccent={!!selectionFormat[tools.link.id]}
      />
    </div>
  );
}

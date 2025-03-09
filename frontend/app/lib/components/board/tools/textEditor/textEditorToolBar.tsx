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
  HeadingIcon,
  ItalicIcon,
  LinkIcon,
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
import LinkPicker from '@/app/lib/components/board/tools/linkPicker';
import ColorPicker from '@/app/lib/components/board/tools/colorPicker';
import { to_rgb } from '@/tailwind.config';
import EditorToolDropdown from '@/app/lib/components/board/tools/textEditor/editorToolDropdown';

interface EditorTool {
  id?: string;
  value: string | boolean | number;
  ToolIcon: JSX.Element;
}

interface EditorDropdown {
  id: string;
  options: EditorTool[];
  defaultIcon: JSX.Element;
}

export default function TextEditorToolBar({
  selectionFormat,
  setSelectionFormat,
  quillRef,
  saveSelection,
  restoreSelection,
}) {
  const defaultLink = '/';
  const defaultColor = `rgba(${to_rgb('#171717')}, 1)`;
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
        defaultIcon: HeadingIcon,
      },
      {
        id: 'list',
        options: [
          { value: 'bullet', ToolIcon: ListIcon },
          { value: 'ordered', ToolIcon: ListOrderedIcon },
          // { value: 'check', ToolIcon: ListChecksIcon },
        ],
        defaultIcon: ListIcon,
      },
      {
        id: 'align',
        options: [
          { value: 'center', ToolIcon: AlignCenterIcon },
          { value: 'justify', ToolIcon: AlignJustifyIcon },
          { value: 'left', ToolIcon: AlignLeftIcon },
          { value: 'right', ToolIcon: AlignRightIcon },
        ],
        defaultIcon: AlignCenterIcon,
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
        'flex h-14 w-fit justify-start gap-1 p-2 sm:p-3',
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
        value={selectionFormat[tools.link.id]}
        Icon={tools.link.ToolIcon}
        isAccent={!!selectionFormat[tools.link.id]}
        popover={true}
        PopoverInnerContent={LinkPicker}
        handleClick={handleClick}
        saveSelection={saveSelection}
        restoreSelection={restoreSelection}
      />

      <Divider key={`link`} orientation={`vertical`} />

      {tools.color.map((tool, index) => {
        return (
          <EditorToolButton
            id={tool.id}
            value={selectionFormat[tool.id]}
            Icon={tool.ToolIcon}
            isAccent={!!selectionFormat[tool.id]}
            popover={true}
            PopoverInnerContent={ColorPicker}
            handleClick={handleClick}
            saveSelection={saveSelection}
            restoreSelection={restoreSelection}
            key={index}
          />
        );
      })}

      <Divider key={`color`} orientation={`vertical`} />

      {tools.dropdown.map((dropdown, index) => {
        return (
          <EditorToolDropdown
            handleClick={handleClick}
            id={dropdown.id}
            options={dropdown.options}
            activeOption={selectionFormat[dropdown.id]}
            Icon={
              dropdown.options.find(
                (option) => option.value === selectionFormat[dropdown.id],
              )?.ToolIcon || dropdown.defaultIcon
            }
            isAccent={!!selectionFormat[dropdown.id]}
            key={index}
          />
        );
      })}
    </div>
  );
}

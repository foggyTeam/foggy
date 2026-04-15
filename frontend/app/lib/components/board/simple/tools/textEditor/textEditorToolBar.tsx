import React from 'react';
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BaselineIcon,
  BoldIcon,
  CodeIcon,
  ColumnsIcon,
  Grid2x2PlusIcon,
  Grid2x2XIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  HeadingIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  PaintBucketIcon,
  QuoteIcon,
  RemoveFormattingIcon,
  RowsIcon,
  SquareCodeIcon,
  StrikethroughIcon,
  TableIcon,
  UnderlineIcon,
} from 'lucide-react';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import Quill from 'quill';
import clsx from 'clsx';
import { Divider } from '@heroui/divider';
import EditorToolButton from '@/app/lib/components/board/simple/tools/textEditor/editorToolButton';
import LinkPicker from '@/app/lib/components/board/simple/tools/linkPicker';
import ColorPicker from '@/app/lib/components/board/simple/tools/colorPicker';
import { foggy_accent, to_rgb } from '@/tailwind.config';
import EditorToolDropdown from '@/app/lib/components/board/simple/tools/textEditor/editorToolDropdown';

interface EditorTool {
  id: string;
  value: string | boolean | number;
  ToolIcon: React.ComponentType<any>;
}

interface EditorDropdown {
  id: string;
  options: Omit<EditorTool, 'id'>[];
  defaultIcon: React.ComponentType<any>;
}

export default function TextEditorToolBar({
  selectionFormat,
  setSelectionFormat,
  quillRef,
  saveSelection,
  restoreSelection,
  isExtended,
}: any) {
  const defaultLink = '/';
  const defaultColor = `rgba(${to_rgb(foggy_accent.light.DEFAULT)}, 1)`;
  const defaultBackground = '';

  const tools: {
    base: EditorTool[];
    link: EditorTool;
    color: EditorTool[];
    dropdown: EditorDropdown[];
    code: EditorTool[];
    table: { insert: EditorTool; dropdowns: EditorDropdown[] };
    clear: any;
  } = {
    base: [
      { id: 'bold', value: true, ToolIcon: BoldIcon },
      { id: 'italic', value: true, ToolIcon: ItalicIcon },
      { id: 'underline', value: true, ToolIcon: UnderlineIcon },
      { id: 'strike', value: true, ToolIcon: StrikethroughIcon },
      { id: 'blockquote', value: true, ToolIcon: QuoteIcon },
      { id: 'hr', value: true, ToolIcon: MinusIcon },
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
    code: [
      { id: 'code', value: true, ToolIcon: CodeIcon },
      { id: 'code-block', value: true, ToolIcon: SquareCodeIcon },
    ] as EditorTool[],
    table: {
      insert: {
        id: 'insertTable',
        value: true,
        ToolIcon: TableIcon,
      } as EditorTool,
      dropdowns: [
        {
          id: 'insert',
          options: [
            { value: 1, ToolIcon: ColumnsIcon },
            { value: 2, ToolIcon: RowsIcon },
          ],
          defaultIcon: Grid2x2PlusIcon,
        },
        {
          id: 'remove',
          options: [
            { value: 1, ToolIcon: ColumnsIcon },
            { value: 2, ToolIcon: RowsIcon },
          ],
          defaultIcon: Grid2x2XIcon,
        },
      ] as EditorDropdown[],
    },
    clear: {
      id: 'clear',
      ToolIcon: RemoveFormattingIcon as React.ComponentType<any>,
    },
  };

  function handleTableActions(clickType: string, value?: number) {
    const quill = quillRef.current as Quill;
    const tableModule = quill?.getModule('table') as any;

    if (!tableModule || !quill) return;

    switch (clickType) {
      case 'insertTable':
        tableModule.insertTable(3, 3);
        break;
      case 'insert':
        if (value === 2) tableModule.insertRowBelow();
        else tableModule.insertColumnRight();
        break;
      case 'remove':
        if (value === 2) tableModule.deleteRow();
        else tableModule.deleteColumn();
        break;
    }
  }

  function handleClick(clickType: string, value: string | boolean | number) {
    if (quillRef.current) {
      const quill = quillRef.current as Quill;

      if (clickType === 'clear') {
        const range = quill.getSelection();
        if (range) quill.removeFormat(range.index, range.length);
      } else if (clickType === 'hr') {
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, 'divider', true, Quill.sources.USER);
        quill.setSelection(range.index + 1, 0, Quill.sources.SILENT);
      } else {
        const currentValue = quill.getFormat()[clickType];
        const newFormat = value == currentValue ? false : value;

        quill.format(clickType, newFormat);

        setSelectionFormat({
          ...selectionFormat,
          [clickType]: newFormat,
        });
      }
    }
  }

  return (
    <div
      className={clsx(
        bg_container_no_padding,
        'flex h-fit w-full max-w-fit flex-wrap items-center justify-start gap-1 p-2 sm:p-3',
      )}
    >
      {tools.base.map((tool, index) => {
        if (tool.id === 'hr' && !isExtended) return null;
        return (
          <EditorToolButton
            id={tool.id}
            value={tool.value}
            handleClick={handleClick}
            Icon={tool.ToolIcon}
            isAccent={selectionFormat[tool.id] === tool.value}
            key={`${tool.id}${index}`}
          />
        );
      })}
      <Divider
        key={`base`}
        orientation="vertical"
        className="h-10 border-none outline-none"
      />

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

      <Divider
        key={`link`}
        orientation={`vertical`}
        className="h-10 border-none outline-none"
      />

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

      <Divider
        key={`color`}
        orientation="vertical"
        className="h-10 border-none outline-none"
      />

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

      {isExtended && (
        <>
          <Divider
            key={`code`}
            orientation="vertical"
            className="h-10 border-none outline-none"
          />

          {tools.code.map((tool, index) => {
            return (
              <EditorToolButton
                id={tool.id}
                value={tool.value}
                handleClick={handleClick}
                Icon={tool.ToolIcon}
                isAccent={
                  selectionFormat[tool.id] === tool.value ||
                  !!selectionFormat[tool.id]
                }
                key={`${tool.id}${index}`}
              />
            );
          })}

          <Divider
            key={`table`}
            orientation="vertical"
            className="h-10 border-none outline-none"
          />

          <EditorToolButton
            id={tools.table.insert.id}
            value={tools.table.insert.value}
            handleClick={() => handleTableActions(tools.table.insert.id)}
            Icon={tools.table.insert.ToolIcon}
            isAccent={!!selectionFormat['table']}
          />

          {tools.table.dropdowns.map((dropdown, index) => (
            <EditorToolDropdown
              handleClick={handleTableActions}
              id={dropdown.id}
              options={dropdown.options}
              activeOption={selectionFormat[dropdown.id]}
              Icon={dropdown.defaultIcon}
              isAccent={false}
              isDisabled={!selectionFormat['table']}
              key={index}
            />
          ))}
        </>
      )}

      <Divider
        key={`clear`}
        orientation="vertical"
        className="h-10 border-none outline-none"
      />

      <EditorToolButton
        id={tools.clear.id}
        value={false}
        handleClick={handleClick}
        Icon={tools.clear.ToolIcon}
        isAccent={false}
      />
    </div>
  );
}

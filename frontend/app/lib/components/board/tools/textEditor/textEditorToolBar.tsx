import React from 'react';
import { Button } from '@heroui/button';
import {
  BoldIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  LinkIcon,
  QuoteIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from 'lucide-react';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import Quill from 'quill';
import clsx from 'clsx';
import { Divider } from '@heroui/divider';

/*
TODO:
[{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
['link'],
[{ align: [] }],
[{ color: [] }, { background: [] }],
['clean'],
 */

export default function TextEditorToolBar({
  selectionFormat,
  setSelectionFormat,
  quillRef,
}) {
  const textEditorTools = [
    [
      {
        id: 'bold',
        value: true,
        ToolIcon: BoldIcon,
      },
      {
        id: 'italic',
        value: true,
        ToolIcon: ItalicIcon,
      },
      {
        id: 'underline',
        value: true,
        ToolIcon: UnderlineIcon,
      },
      {
        id: 'strike',
        value: true,
        ToolIcon: StrikethroughIcon,
      },
      {
        id: 'blockquote',
        value: true,
        ToolIcon: QuoteIcon,
      },
    ],
    [
      { id: 'header', value: 1, ToolIcon: Heading1Icon },
      { id: 'header', value: 2, ToolIcon: Heading2Icon },
      { id: 'header', value: 3, ToolIcon: Heading3Icon },
    ],
    [{ id: 'link', value: '/', ToolIcon: LinkIcon }],
  ];

  const handleClick = (clickType, value) => {
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
  };

  return (
    <div
      className={clsx(
        bg_container_no_padding,
        'flex h-14 w-full justify-start gap-1 p-2 sm:p-3',
      )}
    >
      {textEditorTools.map((section, index) => {
        let toolSection = section.map(({ id, value, ToolIcon }, index) => {
          return (
            <Button
              id={id}
              onPress={() => handleClick(id, value)}
              key={`${id}${index}`}
              variant="light"
              isIconOnly
              size="sm"
            >
              <ToolIcon
                className={
                  selectionFormat[id] === value
                    ? 'h-5 w-5 stroke-f_accent'
                    : 'h-5 w-5 stroke-default-500'
                }
              />
            </Button>
          );
        });
        toolSection.push(
          <Divider key={`divider${index}`} orientation={`vertical`} />,
        );
        return toolSection;
      })}
    </div>
  );
}

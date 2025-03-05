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
        ToolIcon: BoldIcon,
      },
      {
        id: 'italic',
        ToolIcon: ItalicIcon,
      },
      {
        id: 'underline',
        ToolIcon: UnderlineIcon,
      },
      {
        id: 'strike',
        ToolIcon: StrikethroughIcon,
      },
      {
        id: 'blockquote',
        ToolIcon: QuoteIcon,
      },
    ],
    [
      { id: 'header-1', ToolIcon: Heading1Icon },
      { id: 'header-2', ToolIcon: Heading2Icon },
      { id: 'header-3', ToolIcon: Heading3Icon },
    ],
    [{ id: 'link', ToolIcon: LinkIcon }],
  ];

  const handleClick = (event) => {
    if (quillRef.current) {
      const id: string = event.target.id;
      // если id сложный и содержит значение, отделим его
      const { clickType, value } = id.includes('-')
        ? { clickType: id.split('-')[0], value: parseInt(id.split('-')[1]) }
        : { clickType: id, value: undefined };
      // получим и обновим данные о выделенном фрагменте из Quill
      const quill = quillRef.current as Quill;
      const isType = quill.getFormat()[clickType];
      const newFormat =
        value && !isType ? value : isType === value ? !isType : value;
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
        let toolSection = section.map(({ id, ToolIcon }, index) => {
          const { realId, value } = {
            realId: id.split('-')[0],
            value: parseInt(id.split('-')[1]),
          };
          return (
            <Button
              id={id}
              onPress={handleClick}
              key={`${id}${index}`}
              variant="light"
              isIconOnly
              size="sm"
            >
              <ToolIcon
                className={
                  (
                    value
                      ? selectionFormat[realId] === value
                      : selectionFormat[realId]
                  )
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

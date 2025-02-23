'use client';

import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
import { Button } from '@heroui/button';
import {
  FrameIcon,
  HighlighterIcon,
  MoreVerticalIcon,
  MousePointer2Icon,
  PencilIcon,
  StickyNoteIcon,
  TypeIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { primary } from '@/tailwind.config';

const ToolBar = () => {
  const [activeTool, setActiveTool] = useState('');
  const iconRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (activeTool && iconRef.current) {
      const svgElement = iconRef.current;
      svgElement.setAttribute('stroke', primary.DEFAULT);

      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
      document.body.style.cursor = `url(${svgDataUrl}) 24 24, auto`;
    } else {
      document.body.style.cursor = 'auto';
    }

    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [activeTool]);

  return (
    <div
      className={clsx(
        'absolute bottom-0 left-0 right-0 z-50 flex w-full justify-self-center sm:bottom-4 sm:left-auto sm:right-auto sm:w-fit',
        'justify-center gap-1 px-2 py-3 sm:rounded-2xl sm:rounded-tr-[64px] sm:px-6',
        bg_container,
        'rounded-none',
      )}
    >
      <Button
        onPress={() => setActiveTool('pointer')}
        variant={activeTool == 'pointer' ? 'flat' : 'light'}
        color={activeTool == 'pointer' ? 'primary' : 'default'}
        isIconOnly
        size="md"
      >
        <MousePointer2Icon
          ref={activeTool == 'pointer' ? iconRef : null}
          className={
            activeTool == 'pointer'
              ? 'stroke-primary-500'
              : 'stroke-default-500'
          }
        />
      </Button>
      <Button
        onPress={() => setActiveTool('frame')}
        variant={activeTool == 'frame' ? 'flat' : 'light'}
        color={activeTool == 'frame' ? 'primary' : 'default'}
        isIconOnly
        size="md"
      >
        <FrameIcon
          ref={activeTool == 'frame' ? iconRef : null}
          className={
            activeTool == 'frame' ? 'stroke-primary-500' : 'stroke-default-500'
          }
        />
      </Button>
      <Button
        isIconOnly
        onPress={() => setActiveTool('type')}
        variant={activeTool == 'type' ? 'flat' : 'light'}
        color={activeTool == 'type' ? 'primary' : 'default'}
        size="md"
      >
        <TypeIcon
          ref={activeTool == 'type' ? iconRef : null}
          className={
            activeTool == 'type' ? 'stroke-primary-500' : 'stroke-default-500'
          }
        />
      </Button>
      <Button
        isIconOnly
        onPress={() => setActiveTool('pencil')}
        variant={activeTool == 'pencil' ? 'flat' : 'light'}
        color={activeTool == 'pencil' ? 'primary' : 'default'}
        size="md"
      >
        <PencilIcon
          ref={activeTool == 'pencil' ? iconRef : null}
          className={
            activeTool == 'pencil' ? 'stroke-primary-500' : 'stroke-default-500'
          }
        />
      </Button>
      <Button
        isIconOnly
        onPress={() => setActiveTool('highlighter')}
        variant={activeTool == 'highlighter' ? 'flat' : 'light'}
        color={activeTool == 'highlighter' ? 'primary' : 'default'}
        size="md"
      >
        <HighlighterIcon
          ref={activeTool == 'highlighter' ? iconRef : null}
          className={
            activeTool == 'highlighter'
              ? 'stroke-primary-500'
              : 'stroke-default-500'
          }
        />
      </Button>
      <Button
        isIconOnly
        onPress={() => setActiveTool('note')}
        variant={activeTool == 'note' ? 'flat' : 'light'}
        color={activeTool == 'note' ? 'primary' : 'default'}
        size="md"
      >
        <StickyNoteIcon
          ref={activeTool == 'note' ? iconRef : null}
          className={
            activeTool == 'note' ? 'stroke-primary-500' : 'stroke-default-500'
          }
        />
      </Button>
      <Button
        isIconOnly
        onPress={() => setActiveTool('')}
        variant="light"
        size="md"
      >
        <MoreVerticalIcon className="stroke-default-500" />
      </Button>
    </div>
  );
};

export default ToolBar;

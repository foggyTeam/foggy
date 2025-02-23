'use client';

import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
import { Button } from '@heroui/button';
import { MousePointer2Icon } from 'lucide-react';
import { useState } from 'react';
import { primary } from '@/tailwind.config';

export default function ToolBar({ stageRef }) {
  const [activeTool, setActiveTool] = useState('');

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
          className={
            activeTool == 'pointer'
              ? 'stroke-primary-500'
              : 'stroke-default-500'
          }
        />
      </Button>
    </div>
  );
}

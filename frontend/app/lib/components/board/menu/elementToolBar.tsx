'use client';

import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
import FillTool from '@/app/lib/components/board/tools/fillTool';

export default function ElementToolBar({ element }) {
  const tools = [FillTool];

  return (
    <div
      className={clsx(
        'absolute bottom-20 left-0 right-0 z-50 flex w-full justify-self-center sm:bottom-20 sm:left-auto sm:right-auto sm:w-fit',
        'justify-center gap-1 px-2 py-3 sm:rounded-2xl sm:rounded-tr-[64px] sm:px-6',
        bg_container,
        'rounded-none',
      )}
    >
      {tools.map((Tool, index) => (
        <Tool key={index} element={element}></Tool>
      ))}
    </div>
  );
}

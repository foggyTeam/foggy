'use client';

import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import React from 'react';
import CustomNodeTool from '@/app/lib/components/board/graph/tools/customNodeTool';
import InternalLinkTool from '@/app/lib/components/board/graph/tools/internalLinkTool';
import ExternalLinkTool from '@/app/lib/components/board/graph/tools/externalLinkTool';
import NodeLinkTool from '@/app/lib/components/board/graph/tools/nodeLinkTool';

export default function GraphToolbar() {
  const tools = [
    InternalLinkTool,
    ExternalLinkTool,
    CustomNodeTool,
    NodeLinkTool,
  ];

  return (
    <div
      data-testid="board-toolbar"
      className={clsx(
        'absolute right-0 bottom-0 left-0 z-30 w-full justify-self-center px-4 py-3 sm:z-50',
        'sm:right-auto sm:bottom-4 sm:left-auto sm:w-fit sm:rounded-2xl sm:rounded-tr-[64px] sm:px-6',
        bg_container_no_padding,
        'flex flex-col justify-center gap-1 rounded-t-none rounded-l-none rounded-r-none',
        'overflow-visible',
      )}
    >
      <div className="flex justify-center gap-1">
        {tools.map((Tool, index) => (
          <Tool key={index} />
        ))}
      </div>
    </div>
  );
}

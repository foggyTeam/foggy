'use client';

import FillTool from '@/app/lib/components/board/tools/fillTool';
import StrokeTool from '@/app/lib/components/board/tools/strokeTool';
import SizeTool from '@/app/lib/components/board/tools/sizeTool';
import LayerTool from '@/app/lib/components/board/tools/layerTool';
import DeleteTool from '@/app/lib/components/board/tools/deleteTool';
import { Divider } from '@heroui/divider';
import React from 'react';

export default function ElementToolBar({
  updateElement,
  removeElement,
  element,
}) {
  const tools = [FillTool, StrokeTool, SizeTool, LayerTool];

  return (
    <div className="flex justify-center gap-1">
      {tools.map((Tool, index) => (
        <Tool
          key={index}
          element={element}
          updateElement={updateElement}
          removeElement={removeElement}
        ></Tool>
      ))}
      <Divider className="mx-0.5" orientation={`vertical`} />

      <DeleteTool element={element} removeElement={removeElement} />
    </div>
  );
}

'use client';

import FillTool from '@/app/lib/components/board/tools/fillTool';
import StrokeTool from '@/app/lib/components/board/tools/strokeTool';
import SizeTool from '@/app/lib/components/board/tools/sizeTool';
import LayerTool from '@/app/lib/components/board/tools/layerTool';
import React from 'react';

export default function ElementToolBar() {
  const tools = [FillTool, StrokeTool, SizeTool, LayerTool];

  return (
    <div className="flex justify-center gap-1">
      {tools.map((Tool: any, index) => (
        <Tool key={index} />
      ))}
    </div>
  );
}

'use client';

import FillTool from '@/app/lib/components/board/tools/fillTool';
import StrokeTool from '@/app/lib/components/board/tools/strokeTool';
import SizeTool from '@/app/lib/components/board/tools/sizeTool';

export default function ElementToolBar({ updateElement, element }) {
  const tools = [FillTool, StrokeTool, SizeTool];

  return (
    <div className="flex justify-center gap-1">
      {tools.map((Tool, index) => (
        <Tool
          key={index}
          element={element}
          updateElement={updateElement}
        ></Tool>
      ))}
    </div>
  );
}

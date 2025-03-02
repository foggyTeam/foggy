'use client';

import FillTool from '@/app/lib/components/board/tools/fillTool';

export default function ElementToolBar({ updateElement, element }) {
  const tools = [FillTool];

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

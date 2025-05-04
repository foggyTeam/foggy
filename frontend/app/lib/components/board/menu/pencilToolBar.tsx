'use client';

import React, { useEffect, useState } from 'react';
import ColorTool from '@/app/lib/components/board/tools/colorTool';
import { PencilParams } from '@/app/lib/components/board/tools/drawingHandlers';

export type ElementToolProps = {
  element: any;
  updateElement?: any;
  removeElement?: any;
};

export default function PencilToolBar({
  pencilParams,
  setPencilParams,
}: {
  pencilParams: PencilParams;
  setPencilParams: (newParams: Partial<PencilParams>) => void;
}) {
  const [color, setColor] = useState(pencilParams.color);

  useEffect(() => {
    setPencilParams({ ...pencilParams, color });
  }, [color, setPencilParams]);

  return (
    <div className="flex justify-center gap-1">
      <ColorTool color={color} setColor={setColor} />
    </div>
  );
}

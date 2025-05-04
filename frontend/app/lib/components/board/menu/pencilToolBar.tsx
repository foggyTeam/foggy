'use client';

import React, { useEffect, useState } from 'react';
import ColorTool from '@/app/lib/components/board/tools/pencilTools/colorTool';
import { PencilParams } from '@/app/lib/components/board/tools/drawingHandlers';
import SliderTool from '@/app/lib/components/board/tools/pencilTools/sliderTool';
import LineCapTool from '@/app/lib/components/board/tools/pencilTools/lineCapTool';
import { LineElement } from '@/app/lib/types/definitions';
import LayerTool from '@/app/lib/components/board/tools/layerTool';

export default function PencilToolBar({
  updateElement,
  element,
  pencilParams,
  setPencilParams,
}: {
  updateElement?: any;
  element?: any;
  pencilParams: PencilParams;
  setPencilParams?: (newParams: Partial<PencilParams>) => void;
}) {
  const selectedElement: LineElement | undefined = element?.attrs;
  const additionalTools = [LayerTool];

  const [color, setColor] = useState(
    selectedElement?.stroke || pencilParams.color,
  );
  const [width, setWidth] = useState(
    selectedElement?.strokeWidth || pencilParams.width,
  );
  const [tension, setTension] = useState(
    (selectedElement?.tension || pencilParams.tension) * 10,
  );
  const [lineCap, setLineCap] = useState(
    selectedElement?.lineCap || pencilParams.lineCap,
  );

  useEffect(() => {
    if (!selectedElement)
      setPencilParams({
        ...pencilParams,
        color,
        width,
        tension: tension / 10,
        lineCap,
      });
    else
      updateElement(selectedElement.id, {
        stroke: color,
        strokeWidth: width,
        lineCap,
        tension: tension / 10,
      } as Partial<LineElement>);
  }, [color, width, tension, lineCap, element, setPencilParams]);

  return (
    <div className="flex justify-center gap-1">
      <ColorTool color={color} setColor={setColor} />
      <SliderTool type="width" value={width} setValue={setWidth} />
      <SliderTool type="tension" value={tension} setValue={setTension} />
      <LineCapTool value={lineCap} setValue={setLineCap} />
      {element &&
        additionalTools.map((Tool: any, index) => (
          <Tool key={index} element={element} updateElement={updateElement} />
        ))}
    </div>
  );
}

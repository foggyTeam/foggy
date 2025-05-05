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
  const additionalTools = [LayerTool];

  const [color, setColor] = useState(pencilParams.color);
  const [width, setWidth] = useState(pencilParams.width);
  const [tension, setTension] = useState(pencilParams.tension * 10);
  const [lineCap, setLineCap] = useState(pencilParams.lineCap);

  useEffect(() => {
    if (element?.attrs) {
      setColor(element.attrs.stroke);
      setWidth(element.attrs.strokeWidth);
      setTension(element.attrs.tension * 10);
      setLineCap(element.attrs.lineCap);
    }
  }, [element]);

  useEffect(() => {
    if (!element?.attrs)
      setPencilParams({
        ...pencilParams,
        color,
        width,
        tension: tension / 10,
        lineCap,
      });
    else
      updateElement(element.attrs.id, {
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

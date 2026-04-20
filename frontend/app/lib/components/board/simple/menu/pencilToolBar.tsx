'use client';

import React, { useEffect, useState } from 'react';
import ColorTool from '@/app/lib/components/board/simple/tools/pencilTools/colorTool';
import { PencilParams } from '@/app/lib/components/board/simple/tools/drawingHandlers';
import SliderTool from '@/app/lib/components/board/simple/tools/pencilTools/sliderTool';
import LineCapTool from '@/app/lib/components/board/simple/tools/pencilTools/lineCapTool';
import { LineElement } from '@/app/lib/types/definitions';
import LayerTool from '@/app/lib/components/board/simple/tools/elementTools/layerTool';
import { useBoardContext } from '@/app/lib/components/board/simple/boardContext';

export default function PencilToolBar({
  pencilParams,
  setPencilParams,
}: {
  pencilParams: PencilParams;
  setPencilParams: (newParams: PencilParams) => void;
}) {
  const { selectedElement, updateElement } = useBoardContext();

  const additionalTools = [LayerTool];

  const [color, setColor] = useState<string>(
    selectedElement?.attrs?.stroke || pencilParams.color,
  );
  const [width, setWidth] = useState<number>(
    selectedElement?.attrs?.strokeWidth || pencilParams.width,
  );
  const [tension, setTension] = useState<number>(
    selectedElement?.attrs
      ? selectedElement.attrs.tension * 10
      : pencilParams.tension * 10,
  );
  const [lineCap, setLineCap] = useState<LineElement['lineCap']>(
    selectedElement?.attrs?.lineCap || pencilParams.lineCap,
  );

  useEffect(() => {
    if (selectedElement?.attrs) {
      setColor(selectedElement.attrs.stroke);
      setWidth(selectedElement.attrs.strokeWidth);
      setTension(selectedElement.attrs.tension * 10);
      setLineCap(selectedElement.attrs.lineCap);
    }
  }, [selectedElement]);

  useEffect(() => {
    if (!selectedElement?.attrs)
      setPencilParams({
        ...pencilParams,
        color,
        width,
        tension: tension / 10,
        lineCap,
      });
    else
      updateElement(selectedElement.attrs.id, {
        stroke: color,
        strokeWidth: width,
        lineCap,
        tension: tension / 10,
      } as Partial<LineElement>);
  }, [color, width, tension, lineCap]);

  return (
    <div className="flex justify-center gap-1">
      <ColorTool color={color} setColor={setColor} />
      <SliderTool type="width" value={width} setValue={setWidth} />
      <SliderTool type="tension" value={tension} setValue={setTension} />
      <LineCapTool value={lineCap} setValue={setLineCap} />
      {selectedElement &&
        additionalTools.map((Tool: any, index) => <Tool key={index} />)}
    </div>
  );
}

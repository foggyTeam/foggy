import { RefObject } from 'react';

import { BoardElement } from '@/app/lib/types/definitions';
import Konva from 'konva';
import Stage = Konva.Stage;

function getSaveConfig(stage: Stage, layers: BoardElement[][]) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  const min = (a: number, b: number) => (a > b ? b : a);
  const max = (a: number, b: number) => (a > b ? a : b);

  for (const layer of layers) {
    for (const element of layer) {
      if (
        (element.width === 0 || element.height === 0) &&
        element.type !== 'line'
      )
        continue;

      if (element.type === 'line') {
        for (let i = 0; i < element.points.length; i++) {
          if (i % 2) {
            minY = min(minY, element.points[i]);
            maxY = max(maxY, element.points[i]);
          } else {
            minX = min(minX, element.points[i]);
            maxX = max(maxX, element.points[i]);
          }
        }
        continue;
      }

      const x = element.x;
      const y = element.y;
      minX = min(minX, x);
      minY = min(minY, y);

      maxX = max(maxX, x + element.width);
      maxY = max(maxY, x + element.height);
    }
  }

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const pixelRatio = () => {
    if (width > 2000 || height > 2000) return 1;
    if (width > 1000 || height > 1000) return 1.5;
    return 2;
  };

  const stageX = stage.x();
  const stageY = stage.y();
  const scale = stage.scaleX();

  console.log(stageX, stageY, scale);
  const relativeX = (minX - -stageX) * scale;
  const relativeY = (minY - -stageY) * scale;
  const relativeWidth = width * scale;
  const relativeHeight = height * scale;

  console.log(relativeX, relativeY);
  return {
    x: relativeX,
    y: relativeY,
    width: relativeWidth,
    height: relativeHeight,
    pixelRatio: pixelRatio(),
    mimeType: 'image/jpeg',
  };
}

export default async function GetBoardImage(
  stageRef: RefObject<Stage | null>,
  boardLayers: BoardElement[][],
): Promise<Blob | null> {
  const stage = stageRef.current;
  if (!stage) return null;

  const config = getSaveConfig(stage, boardLayers);

  try {
    const dataUrl = stageRef.current?.toDataURL(config);
    const blob: Blob | any = await stageRef.current?.toBlob(config);
    if (!blob) throw new Error();

    console.log(blob);
    return blob;
  } catch (e: any) {
    console.error('Failed to create board blob');
  }
  return null;
}

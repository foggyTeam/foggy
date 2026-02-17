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

      const x = element.x;
      const y = element.y;

      if (element.type === 'line') {
        for (let i = 0; i < element.points.length; i++) {
          if (i % 2) {
            minY = min(minY, y + element.points[i]);
            maxY = max(maxY, y + element.points[i]);
          } else {
            minX = min(minX, x + element.points[i]);
            maxX = max(maxX, x + element.points[i]);
          }
        }
        continue;
      }

      minX = min(minX, x);
      minY = min(minY, y);

      maxX = max(maxX, x + element.width);
      maxY = max(maxY, y + element.height);
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

  const relativeMinX = (minX - stageX) / scale;
  const relativeMaxX = (maxX - stageX) / scale;
  const relativeMinY = (stageY - minY) / scale;
  const relativeMaxY = (stageY - maxY) / scale;

  return {
    x: relativeMinX,
    y: relativeMinY,
    width: Math.abs(relativeMaxX - relativeMinX),
    height: Math.abs(relativeMaxY - relativeMinY),
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

    return blob;
  } catch (e: any) {
    console.error('Failed to create board blob');
  }
  return null;
}

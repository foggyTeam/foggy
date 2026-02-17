import { RefObject } from 'react';
import Konva from 'konva';
import { BoardElement } from '@/app/lib/types/definitions';

type Stage = Konva.Stage;

const MAX_SIZE = 2048;

function unionRect(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) {
  const x1 = Math.min(a.x, b.x);
  const y1 = Math.min(a.y, b.y);
  const x2 = Math.max(a.x + a.width, b.x + b.width);
  const y2 = Math.max(a.y + a.height, b.y + b.height);
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}

function getBoundingBox(stage: Stage, layers: BoardElement[][]) {
  let box: { x: number; y: number; width: number; height: number } | null =
    null;

  for (const layer of layers) {
    for (const element of layer) {
      if (!element?.id) continue;

      const node = stage.findOne(`#${element.id}`);
      if (!node) continue;

      const r = node.getClientRect({ skipTransform: false });

      if (r.width <= 0 || r.height <= 0) continue;

      box = box ? unionRect(box, r) : r;
    }
  }

  if (!box) return null;

  const padding = 20;
  return {
    x: Math.floor(box.x - padding),
    y: Math.floor(box.y - padding),
    width: Math.ceil(box.width + padding * 2),
    height: Math.ceil(box.height + padding * 2),
  };
}

export default async function GetBoardImage(
  stageRef: RefObject<Stage | null>,
  boardLayers: BoardElement[][],
): Promise<Blob | null> {
  const stage = stageRef.current;
  if (!stage) return null;

  const boundingBox = getBoundingBox(stage, boardLayers);
  if (!boundingBox) return null;

  const pixelRatio =
    boundingBox.width > 2000 || boundingBox.height > 2000
      ? 1
      : boundingBox.width > 1000 || boundingBox.height > 1000
        ? 1.5
        : 2;

  const maxSide = Math.max(boundingBox.width, boundingBox.height);
  const exportScale = maxSide > MAX_SIZE ? MAX_SIZE / maxSide : 0.95;

  try {
    const blob: Blob | any = await stage.toBlob({
      ...boundingBox,
      pixelRatio,
      mimeType: 'image/jpeg',
      quality: exportScale,
    });
    const url = stage.toDataURL({
      ...boundingBox,
      pixelRatio,
      mimeType: 'image/jpeg',
      quality: exportScale,
    });

    console.log(url);

    return blob ?? null;
  } catch {
    return null;
  }
}

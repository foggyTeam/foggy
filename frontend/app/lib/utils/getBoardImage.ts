import { RefObject } from 'react';
import Konva from 'konva';
import { SBoardElement } from '@/app/lib/types/definitions';

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

function getBoundingBox(stage: Stage, layers: SBoardElement[][]) {
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

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number = 0.92,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), type, quality);
  });
}

export default async function GetBoardImage(
  stageRef: RefObject<Stage | null>,
  boardLayers: SBoardElement[][],
  backgroundColor: string,
): Promise<Blob | null> {
  const stage = stageRef.current;
  if (!stage) return null;

  const boundingBox = getBoundingBox(stage, boardLayers);
  if (!boundingBox) return null;

  const sourceCanvas = stage.toCanvas({
    ...boundingBox,
    pixelRatio: 1,
  });

  const srcW = sourceCanvas.width;
  const srcH = sourceCanvas.height;

  const maxSide = Math.max(srcW, srcH);
  const downScale = maxSide > MAX_SIZE ? MAX_SIZE / maxSide : 1;

  const outW = Math.max(1, Math.round(srcW * downScale));
  const outH = Math.max(1, Math.round(srcH * downScale));

  const outCanvas = document.createElement('canvas');
  outCanvas.width = outW;
  outCanvas.height = outH;

  const ctx = outCanvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, outW, outH);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(sourceCanvas, 0, 0, outW, outH);

  const jpegQuality = 0.92;

  return await canvasToBlob(outCanvas, 'image/jpeg', jpegQuality);
}

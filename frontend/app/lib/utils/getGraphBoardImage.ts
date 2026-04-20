import { Rect } from '@xyflow/react';
import { toCanvas } from 'html-to-image';
import { canvasToBlob } from './getBoardImage';
import { GNode } from '@/app/lib/types/definitions';

const MAX_SIZE = 2048;

export default async function GetGraphBoardImage(
  nodes: GNode[],
  nodesBounds: Rect,
  backgroundColor: string,
): Promise<Blob | null> {
  if (!nodes || nodes.length === 0) return null;

  const viewportElement = document.querySelector<HTMLElement>(
    '.react-flow__viewport',
  );

  if (!viewportElement) return null;

  const padding = 20;

  const srcW = nodesBounds.width + padding * 2;
  const srcH = nodesBounds.height + padding * 2;

  const maxSide = Math.max(srcW, srcH);
  const downScale = maxSide > MAX_SIZE ? MAX_SIZE / maxSide : 1;

  const outW = Math.max(1, Math.round(srcW * downScale));
  const outH = Math.max(1, Math.round(srcH * downScale));

  const canvas = await toCanvas(viewportElement, {
    backgroundColor,
    width: srcW,
    height: srcH,
    canvasWidth: outW,
    canvasHeight: outH,
    pixelRatio: 1,
    imagePlaceholder:
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    style: {
      width: `${srcW}px`,
      height: `${srcH}px`,
      transform: `translate(${-nodesBounds.x + padding}px, ${-nodesBounds.y + padding}px) scale(1)`,
      transformOrigin: 'top left',
    },
  });

  const jpegQuality = 0.92;
  return await canvasToBlob(canvas, 'image/jpeg', jpegQuality);
}

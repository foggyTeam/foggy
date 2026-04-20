import { getViewportForBounds, Rect } from '@xyflow/react';
import { toCanvas } from 'html-to-image';
import { canvasToBlob } from './getBoardImage';
import { GEdge, GNode } from '@/app/lib/types/definitions';

const MAX_SIZE = 2048;

export default async function GetGraphBoardImage(
  nodes: GNode[],
  edges: GEdge[],
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

  const viewport = getViewportForBounds(
    nodesBounds,
    outW,
    outH,
    0.01,
    10,
    padding * downScale,
  );

  const canvas = await toCanvas(viewportElement, {
    backgroundColor,
    width: outW,
    height: outH,
    style: {
      width: `${outW}px`,
      height: `${outH}px`,
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      transformOrigin: 'top left',
    },
  });

  const jpegQuality = 0.92;
  return await canvasToBlob(canvas, 'image/jpeg', jpegQuality);
}

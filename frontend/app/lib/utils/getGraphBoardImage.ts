import { Rect } from '@xyflow/react';
import { toCanvas } from 'html-to-image';
import { canvasToBlob } from './getBoardImage';
import { GNode } from '@/app/lib/types/definitions';

const MAX_SIZE = 2048;

/** Converts styles from CSS-variables into SVG */
function patchEdgeStyles(container: HTMLElement): () => void {
  const restorers: Array<() => void> = [];

  const patchStyle = (
    el: SVGElement,
    prop: 'stroke' | 'fill',
    attr?: string,
  ) => {
    const computed = getComputedStyle(el)[prop];
    if (!computed || computed === 'none') return;

    const prevInline = el.style[prop];
    el.style[prop] = computed;
    restorers.push(() => {
      el.style[prop] = prevInline;
    });

    if (attr) {
      const prevAttr = el.getAttribute(attr);
      el.setAttribute(attr, computed);
      restorers.push(() => {
        if (prevAttr === null) el.removeAttribute(attr);
        else el.setAttribute(attr, prevAttr);
      });
    }
  };

  container
    .querySelectorAll<SVGPathElement>('.react-flow__edge-path')
    .forEach((el) => patchStyle(el, 'stroke', 'stroke'));

  container
    .querySelectorAll<SVGRectElement>('.react-flow__edge-textbg')
    .forEach((el) => patchStyle(el, 'fill', 'fill'));

  container
    .querySelectorAll<SVGTextElement>('.react-flow__edge-text')
    .forEach((el) => patchStyle(el, 'fill', 'fill'));

  return () => restorers.forEach((fn) => fn());
}

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

  const restoreStyles = patchEdgeStyles(viewportElement);
  let canvas: HTMLCanvasElement;
  try {
    canvas = await toCanvas(viewportElement, {
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
  } finally {
    restoreStyles();
  }

  const jpegQuality = 0.92;
  return await canvasToBlob(canvas, 'image/jpeg', jpegQuality);
}

import { customNodeSchema } from '@/app/lib/types/schemas';
import { GCustomNode, GEdge } from '@/app/lib/types/definitions';
import { foggy_accent } from '@/tailwind.config';

function getSchemaRules(schema: any) {
  let rules = { length: 10, regex: new RegExp('.*') };

  let currentSchema = schema;
  while (currentSchema && currentSchema._def && currentSchema._def.innerType) {
    currentSchema = currentSchema._def.innerType;
  }

  for (const check of currentSchema._def.checks) {
    if (check.kind === 'max') rules.length = check.value;
    if (check.kind === 'regex') rules.regex = check.regex;
  }
  return rules;
}

function clearFromTags(text: string) {
  return text
    .replace(/<[^>]+>/g, '')
    .trim()
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

function sanitizeText(text: string, length: number, regex: RegExp): string {
  let sanitized = text;

  // cleansing from forbidden symbols
  if (regex && !regex.test(sanitized)) {
    const testRegex = new RegExp(regex.source, regex.flags.replace('g', ''));

    sanitized = Array.from(sanitized)
      .filter((char) => testRegex.test(char))
      .join('');
  }

  // shortening if needed
  if (sanitized.length > length) sanitized = sanitized.slice(0, length);

  sanitized = sanitized.trim();

  return sanitized;
}

const MIN_NODE_HEIGHT = 136;
const MAX_NODE_HEIGHT = 160;
const EDGE_LENGTH = 20;
const NODE_COLOR = foggy_accent.light['200'];
const EDGE_COLOR = foggy_accent.light.DEFAULT;

function chainNodes(
  initialNodes: { title: string | null; text: string }[],
  startPosition: { x: number; y: number },
) {
  const chainedNodes: GCustomNode[] = [];
  const chainEdges: GEdge[] = [];

  let prevNodeId: string | null = null;
  let prevY = startPosition.y;
  for (let i = 0; i < initialNodes.length; i++) {
    const node = initialNodes[i];

    if (!node.title?.length && !node.text?.length) continue;

    const nodeId = `custom-node-${Date.now().toString()}-${i}`;
    const edgeId = `edge-${Date.now().toString()}-${i}`;

    const heightDelta =
      EDGE_LENGTH + (!!node.title ? MAX_NODE_HEIGHT : MIN_NODE_HEIGHT);
    const newNode: GCustomNode = {
      id: nodeId,
      type: 'customNode',
      position: { x: startPosition.x, y: prevY + heightDelta },
      hidden: false,
      data: {
        shape: 'rect',
        align: 'start',
        color: NODE_COLOR,
        title: node.title || undefined,
        description: node.text,
      },
    };

    chainedNodes.push(newNode);
    if (prevNodeId) {
      const newEdge: GEdge = {
        id: edgeId,
        type: 'smoothstep',
        source: prevNodeId,
        target: nodeId,
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        style: {
          stroke: EDGE_COLOR,
          strokeWidth: 2,
        },
        animated: true,
      };
      chainEdges.push(newEdge);
    }
    prevNodeId = nodeId;
    prevY += heightDelta;
  }

  return { nodes: chainedNodes, edges: chainEdges };
}

/** Prepares a chain of nodes for GRAPH board from AI summary response
 * @param summary - HTML string with generated content (wrapped in <p>)
 * @param position - position of the first node in chain */
export default function getGraphNodesChain(
  summary: string,
  position: { x: number; y: number },
) {
  const titleRules = getSchemaRules(customNodeSchema.shape.title);
  const textRules = getSchemaRules(customNodeSchema.shape.description);

  const nodes: { title: string | null; text: string }[] = [];

  function pushNode(title: string | null, text: string) {
    nodes.push({
      title: title
        ? sanitizeText(title, titleRules.length, titleRules.regex)
        : null,
      text: sanitizeText(text, textRules.length, titleRules.regex),
    });
  }

  const dividerRegex = /<\/(p|li|h[1-6]|div)>/gi;
  const brRegex = /<br\s*\/?>/gi;
  const titleTagRegex = /<(h[1-6])[^>]*>(.*?)<\/\1>/i;

  const blocks = summary
    .replace(dividerRegex, '|||')
    .replace(brRegex, '|||')
    .split('|||')
    .map((block) => block.trim())
    .filter(Boolean);

  for (const block of blocks) {
    let title: string | null = null;
    let description: string = block;

    const titleMatch = block.match(titleTagRegex);
    if (titleMatch) {
      title = clearFromTags(titleMatch[2]);
      description = block.replace(titleMatch[0], '');
    }

    description = clearFromTags(description);

    if (description.length > textRules.length) {
      const segmenter = new Intl.Segmenter(['ru', 'en'], {
        granularity: 'sentence',
      });
      const sentences = Array.from(segmenter.segment(description)).map((s) =>
        s.segment.trim(),
      );

      let currentDesc = '';
      let isFirstChunk = true;

      for (const sentence of sentences) {
        const combined = currentDesc ? `${currentDesc} ${sentence}` : sentence;

        if (combined.length <= textRules.length) {
          currentDesc = combined;
        } else {
          if (currentDesc) {
            pushNode(isFirstChunk ? title : null, currentDesc);
            isFirstChunk = false;
          }

          if (sentence.length > textRules.length)
            currentDesc = sentence.substring(0, textRules.length - 3) + '...';
          else currentDesc = sentence;
        }
      }

      if (currentDesc) pushNode(isFirstChunk ? title : null, currentDesc);
    } else pushNode(title, description);
  }

  return chainNodes(nodes, position);
}

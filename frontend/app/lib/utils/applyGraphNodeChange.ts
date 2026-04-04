import type { NodeChange } from '@xyflow/react';

export default function applyGraphNodeChange(change: NodeChange) {
  switch (change.type) {
    case 'position': {
      const result: Record<string, unknown> = {};
      if (change.position !== undefined) result.position = change.position;
      if (change.dragging !== undefined) result.dragging = change.dragging;
      return result;
    }

    case 'dimensions':
      return {
        measured: change.dimensions,
      };

    case 'select':
      return {
        selected: change.selected,
      };

    case 'replace':
      return change.item;
  }
  return {};
}

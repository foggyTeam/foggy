import type { NodeChange } from '@xyflow/react';

export default function applyGraphNodeChange(change: NodeChange) {
  switch (change.type) {
    case 'position':
      return {
        position: change.position,
        dragging: change.dragging,
      };

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

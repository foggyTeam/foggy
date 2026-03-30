import { EdgeChange, NodeChange } from '@xyflow/react';
import { toArray } from 'lodash';

type Change = NodeChange | EdgeChange;
type ChangeTypes = Change['type'];
const LOCAL_ONLY_CHANGES = new Set<ChangeTypes>(['dimensions']);

export default function batchGraphUpdates(updatesQueue: Change[][]): {
  changes: Change[];
  lockUpdates: { id: string; lock: boolean }[];
} {
  const lastStateById = new Map<string, Change>();
  const lockUpdates = new Map<string, boolean>();

  const batched: Change[] = [];

  for (const updates of updatesQueue) {
    for (const update of updates) {
      if (LOCAL_ONLY_CHANGES.has(update.type)) continue;

      if (update.type === 'add') {
        batched.push(update);
        continue;
      }

      const id = update.id;

      if (update.type === 'remove') {
        lastStateById.delete(`position:${id}`);
        lastStateById.delete(`replace:${id}`);
        lastStateById.delete(`select:${id}`);
        batched.push(update);
        continue;
      }

      if (update.type === 'select') {
        lockUpdates.set(id, update.selected);
        continue;
      }

      lastStateById.set(`${update.type}:${id}`, update);
    }
  }

  const lockUpdatesArray = toArray(lockUpdates.entries()).map((entry) => {
    return { id: entry[0], lock: entry[1] };
  });

  return {
    changes: [...batched, ...lastStateById.values()],
    lockUpdates: lockUpdatesArray,
  };
}

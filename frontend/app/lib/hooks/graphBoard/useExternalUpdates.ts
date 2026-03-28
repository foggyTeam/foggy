'use client';

import { useEffect, useMemo } from 'react';
import throttle from 'lodash/throttle';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import batchGraphUpdates from '@/app/lib/utils/batchGraphUpdates';
import { Node } from '@xyflow/react';
import { GEdge, GNode } from '@/app/lib/types/definitions';
import { autorun } from 'mobx';

export default function useExternalUpdates(
  updateNode: (id: string, update: Partial<Node>) => void,
  addNodes: (nodes: GNode[]) => void,
  updateEdge: (id: string, update: Partial<GEdge>) => void,
  addEdges: (edges: GEdge[]) => void,
  deleteElements: (params: {
    nodes?: { id: string }[];
    edges?: { id: string }[];
  }) => void,
  syncD3: () => void,
) {
  const onExternalNodesChange = useMemo(
    () =>
      throttle(() => {
        const queue = graphBoardStore.nodesExternalUpdatesQueue;
        graphBoardStore.clearUpdatesQueue('nodes');
        if (queue.length === 0) return;

        const { changes, lockUpdates } = batchGraphUpdates(queue);

        let needsSync = false;

        for (const change of changes) {
          switch (change.type) {
            case 'add':
              addNodes([change.item as GNode]);
              needsSync = true;
              break;

            case 'remove':
              deleteElements({ nodes: [{ id: change.id }] });
              needsSync = true;
              break;

            case 'position':
              if (change.position) {
                updateNode(change.id, { position: change.position });
                needsSync = true;
              }
              break;

            case 'replace':
              updateNode(change.id, change.item as Partial<Node>);
              break;

            case 'select':
              updateNode(change.id, { selected: change.selected });
              break;
          }
        }

        for (const { id, lock } of lockUpdates) {
          updateNode(id, {
            draggable: !lock,
            selectable: !lock,
            connectable: !lock,
          });
        }

        if (needsSync) syncD3();
      }, 640),
    [],
  );

  const onExternalEdgesChange = useMemo(
    () =>
      throttle(() => {
        const queue = graphBoardStore.edgesExternalUpdatesQueue;
        graphBoardStore.clearUpdatesQueue('edges');
        if (queue.length === 0) return;

        const { changes } = batchGraphUpdates(queue);

        for (const change of changes) {
          switch (change.type) {
            case 'add':
              addEdges([change.item as GEdge]);
              break;
            case 'remove':
              deleteElements({ edges: [{ id: change.id }] });
              break;
            case 'replace':
              updateEdge(change.id, change.item as GEdge);
              break;
          }
        }
      }, 640),
    [],
  );

  // UPDATES WATCHERS
  useEffect(() => {
    return autorun(() => {
      const _ = graphBoardStore.nodesApplyUpdatesTrigger;
      onExternalNodesChange();
    });
  }, [onExternalNodesChange]);

  useEffect(() => {
    return autorun(() => {
      const _ = graphBoardStore.edgesApplyUpdatesTrigger;
      onExternalEdgesChange();
    });
  }, [onExternalEdgesChange]);

  // CLEANUP
  useEffect(() => {
    return () => {
      onExternalNodesChange.cancel();
      onExternalEdgesChange.cancel();
    };
  }, [onExternalNodesChange, onExternalEdgesChange]);
}

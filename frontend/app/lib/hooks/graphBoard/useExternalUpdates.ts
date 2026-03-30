'use client';

import { useEffect, useMemo } from 'react';
import throttle from 'lodash/throttle';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import batchGraphUpdates from '@/app/lib/utils/batchGraphUpdates';
import { Node, useReactFlow } from '@xyflow/react';
import { GNode } from '@/app/lib/types/definitions';
import { autorun } from 'mobx';

export default function useExternalUpdates(syncD3: () => void) {
  const { updateNode, addNodes, updateEdge, addEdges, deleteElements } =
    useReactFlow();
  const nodesQueue = useMemo(
    () => graphBoardStore.nodesExternalUpdatesQueue,
    [graphBoardStore.nodesExternalUpdatesQueue],
  );
  const edgesQueue = useMemo(
    () => graphBoardStore.edgesExternalUpdatesQueue,
    [graphBoardStore.edgesExternalUpdatesQueue],
  );

  const onExternalNodesChange = useMemo(
    () =>
      throttle(() => {
        graphBoardStore.clearUpdatesQueue('nodes');
        if (nodesQueue.length === 0) return;

        const { changes, lockUpdates } = batchGraphUpdates(nodesQueue);

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
    [
      addNodes,
      deleteElements,
      updateNode,
      nodesQueue,
      graphBoardStore.clearUpdatesQueue,
    ],
  );

  const onExternalEdgesChange = useMemo(
    () =>
      throttle(() => {
        graphBoardStore.clearUpdatesQueue('edges');
        if (edgesQueue.length === 0) return;

        const { changes } = batchGraphUpdates(edgesQueue);

        for (const change of changes) {
          switch (change.type) {
            case 'add':
              addEdges([change.item]);
              break;
            case 'remove':
              deleteElements({ edges: [{ id: change.id }] });
              break;
            case 'replace':
              updateEdge(change.id, change.item);
              break;
          }
        }
      }, 640),
    [
      addEdges,
      deleteElements,
      updateEdge,
      edgesQueue,
      graphBoardStore.clearUpdatesQueue,
    ],
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

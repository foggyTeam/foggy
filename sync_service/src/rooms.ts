import { BoardType, GraphBoardState, Room, SimpleBoardState } from './types';

// ─── Room registry ───────────────────────────────────────────────────────────

const rooms = new Map<string, Room>();

export function getOrCreateRoom(boardId: string, type: BoardType): Room {
  if (!rooms.has(boardId)) {
    rooms.set(boardId, {
      boardId,
      type,
      state: null,
      dirty: false,
      snapshotTimer: null,
    });
    console.info(`[rooms] created room ${boardId} (${type})`);
  }
  return rooms.get(boardId)!;
}

export function getRoom(boardId: string): Room | undefined {
  return rooms.get(boardId);
}

export function deleteRoom(boardId: string): void {
  const room = rooms.get(boardId);
  if (room?.snapshotTimer) clearInterval(room.snapshotTimer);
  rooms.delete(boardId);
  console.info(`[rooms] deleted room ${boardId}`);
}

export function markDirty(room: Room): void {
  room.dirty = true;
}

// ─── SIMPLE state mutations ──────────────────────────────────────────────────

export function simpleAddElement(state: SimpleBoardState, element: any): void {
  if (!state.layers.length) state.layers.push([]);
  state.layers[state.layers.length - 1].push(element);
}

export function simpleUpdateElement(
  state: SimpleBoardState,
  id: string,
  newAttrs: Record<string, any>,
): void {
  for (const layer of state.layers) {
    const idx = layer.findIndex((el) => el.id === id);
    if (idx !== -1) {
      layer[idx] = { ...layer[idx], ...newAttrs };
      return;
    }
  }
}

export function simpleRemoveElement(state: SimpleBoardState, id: string): void {
  for (let l = 0; l < state.layers.length; l++) {
    const idx = state.layers[l].findIndex((el) => el.id === id);
    if (idx !== -1) {
      state.layers[l].splice(idx, 1);
      return;
    }
  }
}

export function simpleChangeElementLayer(
  state: SimpleBoardState,
  id: string,
  prevPos: { layer: number; index: number },
  newPos: { layer: number; index: number },
): void {
  const srcLayer = state.layers[prevPos.layer];
  if (!srcLayer) return;
  const [element] = srcLayer.splice(prevPos.index, 1);
  if (!element) return;

  // Ensure target layer exists
  while (state.layers.length <= newPos.layer) state.layers.push([]);
  state.layers[newPos.layer].splice(newPos.index, 0, element);
}

// ─── GRAPH state mutations ───────────────────────────────────────────────────
//
// ReactFlow sends NodeChange[] / EdgeChange[] with types:
//   'add' | 'remove' | 'position' | 'dimensions' | 'select' | 'reset' (nodes)
//   'add' | 'remove' | 'select' | 'reset' (edges)
//

export function graphApplyNodeChanges(
  state: GraphBoardState,
  changes: any[],
): void {
  for (const change of changes) {
    switch (change.type) {
      case 'add':
        state.nodes.push(change.item);
        break;
      case 'remove':
        state.nodes = state.nodes.filter((n) => n.id !== change.id);
        break;
      case 'position': {
        const node = state.nodes.find((n) => n.id === change.id);
        if (node && change.position) {
          node.position = change.position;
          if (change.positionAbsolute)
            node.positionAbsolute = change.positionAbsolute;
        }
        break;
      }
      case 'dimensions': {
        const node = state.nodes.find((n) => n.id === change.id);
        if (node && change.dimensions) {
          node.width = change.dimensions.width;
          node.height = change.dimensions.height;
        }
        break;
      }
      case 'select': {
        const node = state.nodes.find((n) => n.id === change.id);
        if (node) node.selected = change.selected;
        break;
      }
      case 'reset': {
        const idx = state.nodes.findIndex((n) => n.id === change.item?.id);
        if (idx !== -1) state.nodes[idx] = change.item;
        break;
      }
    }
  }
}

export function graphApplyEdgeChanges(
  state: GraphBoardState,
  changes: any[],
): void {
  for (const change of changes) {
    switch (change.type) {
      case 'add':
        state.edges.push(change.item);
        break;
      case 'remove':
        state.edges = state.edges.filter((e) => e.id !== change.id);
        break;
      case 'select': {
        const edge = state.edges.find((e) => e.id === change.id);
        if (edge) edge.selected = change.selected;
        break;
      }
      case 'reset': {
        const idx = state.edges.findIndex((e) => e.id === change.item?.id);
        if (idx !== -1) state.edges[idx] = change.item;
        break;
      }
    }
  }
}

export function graphUpdateNodeData(
  state: GraphBoardState,
  nodeId: string,
  newAttrs: Record<string, any>,
  isNew?: boolean,
): void {
  if (isNew) {
    state.nodes.push({ id: nodeId, data: newAttrs, position: { x: 0, y: 0 } });
    return;
  }
  const node = state.nodes.find((n) => n.id === nodeId);
  if (node) node.data = { ...(node.data ?? {}), ...newAttrs };
}

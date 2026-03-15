'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import type { Edge, Node } from '@xyflow/react';
import debounce from 'lodash/debounce';

interface D3Node extends SimulationNodeDatum {
  id: string;
  width: number;
  height: number;
}

interface ForcedLayoutOptions {
  linkDistance?: number;
  chargeStrength?: number;
  collideRadius?: number;
}

const DEFAULT_NODE_SIZE = { width: 150, height: 50 };

const DEFAULT_LINK_DISTANCE = 20;
const DEFAULT_STRENGTH = 0.6;
const DEFAULT_COLLIDE_PADDING = 8;

const POSITION_THRESHOLD = 0.2;
const VELOCITY_DECAY = 0.8;
const ALPHA_DECAY = 0.028;
const FORCE_STRENGTH = -100;
const MAX_DISTANCE = 600;
const COLLIDE_STRENGTH = 0.2;
const UNPIN_DELAY = 640;
const SYNC_DEBOUNCE = 256;

export default function useForcedLayout(
  nodes: Node[],
  edges: Edge[],
  updateNode: (id: string, nodeUpdate: Partial<Node>) => void,
  options: ForcedLayoutOptions = {},
) {
  const {
    linkDistance = DEFAULT_LINK_DISTANCE,
    chargeStrength = DEFAULT_STRENGTH,
    collideRadius = DEFAULT_COLLIDE_PADDING,
  } = options;

  const rafId = useRef<number | null>(null);
  const unpinTimeouts = useRef(new Map<string, number>());

  const simulationNodesMap = useRef(new Map<Node['id'], D3Node>());
  const dirtyNodesSet = useRef(new Set<Node['id']>());
  const positionsMap = useRef(new Map<Node['id'], { x: number; y: number }>());
  const prevNodeIds = useRef(new Set<string>());
  const prevEdgeKeys = useRef(new Set<string>());

  const simulation = useRef(
    forceSimulation<D3Node>([])
      .alphaDecay(ALPHA_DECAY)
      .velocityDecay(VELOCITY_DECAY)
      .stop(),
  );

  const restart = useCallback((alpha: number = 0.15) => {
    const sim = simulation.current;

    if (sim.alpha() < sim.alphaMin()) sim.alpha(alpha).restart();
    else sim.alpha(Math.max(sim.alpha(), alpha));
  }, []);

  const scheduleRAFRerender = useCallback(() => {
    for (const d3node of simulationNodesMap.current.values()) {
      const prev = positionsMap.current.get(d3node.id);
      const x = d3node.x ?? 0;
      const y = d3node.y ?? 0;

      if (
        !prev ||
        Math.abs(x - prev.x) > POSITION_THRESHOLD ||
        Math.abs(y - prev.y) > POSITION_THRESHOLD
      ) {
        dirtyNodesSet.current.add(d3node.id);
      }
    }

    if (dirtyNodesSet.current.size === 0 || rafId.current) return;

    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      const dirty = dirtyNodesSet.current;
      dirtyNodesSet.current = new Set();

      for (const nodeId of dirty) {
        const d3node = simulationNodesMap.current.get(nodeId);
        if (!d3node) continue;
        positionsMap.current.set(nodeId, { x: d3node.x!, y: d3node.y! });
        updateNode(nodeId, { position: { x: d3node.x!, y: d3node.y! } });
      }
    });
  }, [updateNode]);

  const syncStructure = useRef(
    debounce(
      (
        nodes: Node[],
        edges: Edge[],
        sMap: Map<Node['id'], D3Node>,
        pMap: Map<Node['id'], { x: number; y: number }>,
        restartFn: (alpha?: number) => void,
        prevNIds: Set<string>,
        prevEKeys: Set<string>,
      ) => {
        const currentNodeIds = new Set(nodes.map((n) => n.id));
        const currentEdgeKeys = new Set(
          edges.map((e) => `${e.source}->${e.target}`),
        );

        let hasStructuralChanges = false;

        for (const node of nodes) {
          if (!prevNIds.has(node.id)) {
            sMap.set(node.id, {
              id: node.id,
              x: node.position.x,
              y: node.position.y,
              width: node.measured?.width ?? DEFAULT_NODE_SIZE.width,
              height: node.measured?.height ?? DEFAULT_NODE_SIZE.height,
            });
            hasStructuralChanges = true;
          } else {
            const d3node = sMap.get(node.id);
            if (d3node) {
              d3node.width = node.measured?.width ?? DEFAULT_NODE_SIZE.width;
              d3node.height = node.measured?.height ?? DEFAULT_NODE_SIZE.height;
            }
          }
        }

        for (const id of prevNIds) {
          if (!currentNodeIds.has(id)) {
            sMap.delete(id);
            pMap.delete(id);
            hasStructuralChanges = true;
          }
        }

        const edgesChanged =
          currentEdgeKeys.size !== prevEKeys.size ||
          [...currentEdgeKeys].some((k) => !prevEKeys.has(k));

        if (edgesChanged) hasStructuralChanges = true;

        prevNodeIds.current = currentNodeIds;
        prevEdgeKeys.current = currentEdgeKeys;

        simulation.current.nodes([...sMap.values()]);
        simulation.current
          .force('link')
          .links(edges.map((e) => ({ source: e.source, target: e.target })));

        if (hasStructuralChanges) {
          restartFn(0.25);
        }
      },
      SYNC_DEBOUNCE,
    ),
  );

  useEffect(() => {
    const manyBodyForce = forceManyBody<D3Node>()
      .strength(FORCE_STRENGTH)
      .distanceMax(MAX_DISTANCE);
    const linkForce = forceLink<D3Node, SimulationLinkDatum<D3Node>>([])
      .id((d) => d.id)
      .distance(linkDistance)
      .strength(chargeStrength);
    const collideForce = forceCollide<D3Node>((d) => {
      return Math.sqrt(d.width ** 2 + d.height ** 2) / 2 + collideRadius;
    }).strength(COLLIDE_STRENGTH);

    simulation.current
      .force('many-body', manyBodyForce)
      .force('link', linkForce)
      .force('collide', collideForce);

    simulation.current.on('tick', scheduleRAFRerender);
    simulation.current.nodes([...simulationNodesMap.current.values()]);

    return () => {
      simulation.current.stop();
      simulation.current.on('tick', null);
      syncStructure.current.cancel();

      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }

      unpinTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  useEffect(() => {
    syncStructure.current(
      nodes,
      edges,
      simulationNodesMap.current,
      positionsMap.current,
      restart,
      prevNodeIds.current,
      prevEdgeKeys.current,
    );
  }, [nodes, edges]);

  const onDrag = useCallback(
    (_event: MouseEvent, node: Node) => {
      const d3node = simulationNodesMap.current.get(node.id);
      if (!d3node) return;

      d3node.fx = node.position.x;
      d3node.fy = node.position.y;
      d3node.x = node.position.x;
      d3node.y = node.position.y;

      simulation.current.alpha(0.3).restart();
    },
    [restart],
  );

  const onDragStop = useCallback((_event: MouseEvent, node: Node) => {
    const d3node = simulationNodesMap.current.get(node.id);
    if (!d3node) return;

    d3node.fx = node.position.x;
    d3node.fy = node.position.y;

    if (unpinTimeouts.current.has(node.id)) {
      clearTimeout(unpinTimeouts.current.get(node.id)!);
    }

    const timeoutId = setTimeout(() => {
      d3node.fx = null;
      d3node.fy = null;
      unpinTimeouts.current.delete(node.id);
    }, UNPIN_DELAY);

    unpinTimeouts.current.set(node.id, timeoutId);
  }, []);

  return { onDrag, onDragStop, restart };
}

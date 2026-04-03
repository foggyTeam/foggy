'use client';

import { useCallback, useEffect, useRef, MouseEvent } from 'react';
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import type { Node } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import debounce from 'lodash/debounce';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { GEdge, GNode } from '@/app/lib/types/definitions';

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

const DEFAULT_LINK_DISTANCE = 280;
const FORCE_STRENGTH = -180;
const MAX_DISTANCE = 180;

const DEFAULT_STRENGTH = 0.06;

const DEFAULT_COLLIDE_PADDING = 12;
const COLLIDE_STRENGTH = 0.35;

const POSITION_THRESHOLD = 0.5;
const VELOCITY_DECAY = 0.75;
const ALPHA_DECAY = 0.08;

const UNPIN_DELAY = 1000;
const SYNC_DEBOUNCE = 256;

const DRAG_ALPHA = 0.16;

export default function useForcedLayout(options: ForcedLayoutOptions = {}) {
  const { isMobile } = useAdaptiveParams();
  const { getNodes, setNodes, getEdges } = useReactFlow();
  const {
    linkDistance = DEFAULT_LINK_DISTANCE,
    chargeStrength = DEFAULT_STRENGTH,
    collideRadius = DEFAULT_COLLIDE_PADDING,
  } = options;

  const rafId = useRef<number | null>(null);
  const unpinTimeouts = useRef(new Map<string, number>());
  const draggedNodes = useRef<Set<string>>(new Set());

  const simulationNodesMap = useRef(new Map<Node['id'], D3Node>());
  const nodes = getNodes() as GNode[];
  const edges = getEdges() as GEdge[];
  const nodeIds = nodes.map((n) => n.id).join(',');
  const edgeKeys = edges.map((e) => `${e.source}-${e.target}`).join(',');
  const nodeSizes = nodes
    .map((n) => `${n.id}:${n.measured?.width ?? 0}x${n.measured?.height ?? 0}`)
    .join(',');

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
    const newAlpha = Math.max(sim.alpha(), alpha);
    if (newAlpha < sim.alphaMin()) return;
    sim.alpha(newAlpha).restart();
  }, []);

  const scheduleRAFRerender = useCallback(() => {
    for (const d3node of simulationNodesMap.current.values()) {
      if (draggedNodes.current.has(d3node.id)) continue;

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

      setNodes((prev) =>
        prev.map((node: GNode) => {
          if (!dirty.has(node.id)) return node;
          const d3node = simulationNodesMap.current.get(node.id);
          if (!d3node) return node;
          positionsMap.current.set(node.id, { x: d3node.x!, y: d3node.y! });
          return { ...node, position: { x: d3node.x!, y: d3node.y! } };
        }),
      );
    });
  }, []);

  const syncStructure = useRef(
    debounce(
      (
        sMap: Map<Node['id'], D3Node>,
        pMap: Map<Node['id'], { x: number; y: number }>,
        restartFn: (alpha?: number) => void,
        prevNIds: Set<string>,
        prevEKeys: Set<string>,
      ) => {
        const nodes = getNodes();
        const edges = getEdges();
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
          restartFn(0.12);
        }
      },
      SYNC_DEBOUNCE,
    ),
  );

  useEffect(() => {
    const manyBodyForce = forceManyBody<D3Node>()
      .strength(FORCE_STRENGTH)
      .distanceMax(MAX_DISTANCE)
      .theta(0.9);
    const linkForce = forceLink<D3Node, SimulationLinkDatum<D3Node>>([])
      .id((d) => d.id)
      .distance(linkDistance)
      .strength(chargeStrength);
    const collideForce = forceCollide<D3Node>((d) => {
      return Math.max(d.width / 2, d.height / 2) + collideRadius;
    }).strength(COLLIDE_STRENGTH);

    simulation.current
      .force('many-body', manyBodyForce)
      .force('link', linkForce)
      .force('collide', collideForce);

    simulation.current.on('tick', () => {
      scheduleRAFRerender();
      if (simulation.current.alpha() < 0.02) simulation.current.stop();
    });

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
      simulationNodesMap.current,
      positionsMap.current,
      restart,
      prevNodeIds.current,
      prevEdgeKeys.current,
    );
  }, [nodeIds, edgeKeys, nodeSizes]);

  const onNodeDrag = useCallback(
    (_event: MouseEvent, node: Node) => {
      if (isMobile) return;

      draggedNodes.current.add(node.id);

      const d3node = simulationNodesMap.current.get(node.id);
      if (!d3node) return;

      d3node.fx = node.position.x;
      d3node.fy = node.position.y;
      d3node.x = node.position.x;
      d3node.y = node.position.y;

      simulation.current.alpha(DRAG_ALPHA).restart();
    },
    [isMobile],
  );

  const onSelectionDrag = useCallback(
    (_event: MouseEvent, nodes: Node[]) => {
      if (isMobile) return;
      nodes.forEach((node) => {
        draggedNodes.current.add(node.id);

        const d3node = simulationNodesMap.current.get(node.id);
        if (d3node) {
          d3node.fx = node.position.x;
          d3node.fy = node.position.y;
        }
      });
      simulation.current.alpha(DRAG_ALPHA).restart();
    },
    [isMobile],
  );

  const onDragStop = useCallback(
    (_event: MouseEvent, nodeOrNodes: Node | Node[]) => {
      if (isMobile) return;
      const nodesArray = Array.isArray(nodeOrNodes)
        ? nodeOrNodes
        : [nodeOrNodes];

      nodesArray.forEach((node) => {
        draggedNodes.current.delete(node.id);

        const d3node = simulationNodesMap.current.get(node.id);
        if (!d3node) return;

        d3node.x = node.position.x;
        d3node.y = node.position.y;
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
      });

      if (draggedNodes.current.size === 0)
        simulation.current.alpha(0.15).restart();
    },
    [isMobile],
  );

  const syncD3 = useCallback(() => {
    if (isMobile) return;
    syncStructure.current(
      simulationNodesMap.current,
      positionsMap.current,
      restart,
      prevNodeIds.current,
      prevEdgeKeys.current,
    );
  }, [isMobile, restart]);

  useEffect(() => {
    if (isMobile) {
      simulation.current.alphaDecay(0.15);
      simulation.current.stop();
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    } else {
      simulation.current.alphaDecay(0.05);
      restart(0.3);
    }
  }, [isMobile]);

  return {
    onNodeDrag,
    onSelectionDrag,
    onDragStop,
    restart,
    syncD3,
  };
}

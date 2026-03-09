'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  Simulation,
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
const DEFAULT_STRENGTH = 0.8;
const DEFAULT_COLLIDE_PADDING = 16;

const POSITION_THRESHOLD = 0.2;
const VELOCITY_DECAY = 0.75;
const ALPHA_DECAY = 0.028;
const FORCE_STRENGTH = -100;
const MAX_DISTANCE = 600;
const COLLIDE_STRENGTH = 0.2;

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
  const simulationNodesMap = useRef(new Map<Node['id'], D3Node>());
  const dirtyNodesSet = useRef(new Set<Node['id']>());
  const positionsMap = useRef(new Map<Node['id'], { x: number; y: number }>());

  const simulation = useRef(
    forceSimulation<D3Node>([])
      .alphaDecay(ALPHA_DECAY)
      .velocityDecay(VELOCITY_DECAY)
      .stop(),
  );

  const restart = useCallback((alpha: number = 0.15) => {
    simulation.current
      .alpha(Math.max(simulation.current.alpha(), alpha))
      .restart();
  }, []);

  const syncWithReactFlow = useRef(
    debounce(
      (
        nodes: Node[],
        edges: Edge[],
        sMap: Map<Node['id'], D3Node>,
        pMap: Map<Node['id'], { x: number; y: number }>,
        restartFn: (alpha?: number) => void,
        sim: Simulation<D3Node, undefined>,
      ) => {
        let hasExternalChanges = false;
        const presentNodes = new Set<string>();

        for (const node of nodes) {
          presentNodes.add(node.id);
          const d3node = sMap.get(node.id);

          if (!d3node) {
            sMap.set(node.id, {
              id: node.id,
              x: node.position.x,
              y: node.position.y,
              width: node.measured?.width ?? DEFAULT_NODE_SIZE.width,
              height: node.measured?.height ?? DEFAULT_NODE_SIZE.height,
            });
            hasExternalChanges = true;
          } else {
            d3node.width = node.measured?.width ?? DEFAULT_NODE_SIZE.width;
            d3node.height = node.measured?.height ?? DEFAULT_NODE_SIZE.height;

            const lastSimPos = pMap.get(node.id);
            if (
              !lastSimPos ||
              Math.abs(node.position.x - lastSimPos.x) > POSITION_THRESHOLD ||
              Math.abs(node.position.y - lastSimPos.y) > POSITION_THRESHOLD
            ) {
              d3node.x = node.position.x;
              d3node.y = node.position.y;
              hasExternalChanges = true;
            }
          }
        }

        for (const id of sMap.keys()) {
          if (!presentNodes.has(id)) {
            sMap.delete(id);
            pMap.delete(id);
            hasExternalChanges = true;
          }
        }

        sim.nodes([...sMap.values()]);
        sim
          .force('link')
          .links(edges.map((e) => ({ source: e.source, target: e.target })));

        if (hasExternalChanges) {
          restartFn(0.25);
        }
      },
      512,
    ),
  );

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

  useEffect(() => {
    nodes.forEach((node) => {
      simulationNodesMap.current.set(node.id, {
        id: node.id,
        x: node.position.x,
        y: node.position.y,
        width: node.measured?.width ?? DEFAULT_NODE_SIZE.width,
        height: node.measured?.height ?? DEFAULT_NODE_SIZE.height,
      });
    });

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
      syncWithReactFlow.current.cancel();
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, []);

  useEffect(() => {
    syncWithReactFlow.current(
      nodes,
      edges,
      simulationNodesMap.current,
      positionsMap.current,
      restart,
      simulation.current,
    );

    return () => {
      syncWithReactFlow.current.cancel();
    };
  }, [nodes, edges]);

  const onDrag = useCallback(
    (event: MouseEvent, node: Node) => {
      const d3node = simulationNodesMap.current.get(node.id);
      if (!d3node) return;

      d3node.fx = node.position.x;
      d3node.fy = node.position.y;
      d3node.x = node.position.x;
      d3node.y = node.position.y;

      restart(0.3);
    },
    [restart],
  );

  const onDragStop = useCallback((event: MouseEvent, node: Node) => {
    const d3node = simulationNodesMap.current.get(node.id);
    if (!d3node) return;

    d3node.fx = node.position.x;
    d3node.fy = node.position.y;

    setTimeout(() => {
      d3node.fx = null;
      d3node.fy = null;
    }, 2000);
  }, []);

  return { onDrag, onDragStop, restart };
}

'use client';

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import type { Edge, Node } from '@xyflow/react';

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
const COLLIDE_PADDING = 24;

export default function useForcedLayout(
  nodes: Node[],
  edges: Edge[],
  setNodes: Dispatch<SetStateAction<any[]>>,
  options: ForcedLayoutOptions = {},
) {
  const {
    linkDistance = 180,
    chargeStrength = 0.5,
    collideRadius = COLLIDE_PADDING,
  } = options;
  const rafId = useRef<number | null>(null);

  const simulationNodesMap = useRef(new Map<Node['id'], D3Node>());
  const dirtyNodesSet = useRef(new Set<Node['id']>());

  const simulation = useRef(
    forceSimulation<D3Node>([]).alphaDecay(0.028).velocityDecay(0.55).stop(),
  );

  const scheduleRAFRerender = useCallback(() => {
    for (const node of simulationNodesMap.current.values())
      dirtyNodesSet.current.add(node.id);

    if (rafId.current) return;

    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      const dirty = dirtyNodesSet.current;
      dirtyNodesSet.current.clear();

      setNodes((prev) =>
        prev.map((node) => {
          if (!dirty.has(node.id)) return node;
          const d3node = simulationNodesMap.current.get(node.id);
          if (!d3node) return node;
          return { ...node, position: { x: d3node.x!, y: d3node.y! } };
        }),
      );
    });

    return () => {
      // Cleanup при размонтировании
      simulation.current.stop();
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [setNodes]);

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

    // FORCES
    const manyBodyForce = forceManyBody<D3Node>()
      .strength(-300)
      .distanceMax(600);
    const linkForce = forceLink<D3Node, SimulationLinkDatum<D3Node>>([])
      .id((d) => d.id)
      .distance(linkDistance)
      .strength(chargeStrength);
    const collideForce = forceCollide<D3Node>((d) => {
      return Math.sqrt(d.width ** 2 + d.height ** 2) / 2 + collideRadius;
    }).strength(0.7);

    // Setting required forces simulation
    simulation.current
      .force('many-body', manyBodyForce)
      .force('link', linkForce)
      .force('collide', collideForce);

    simulation.current.on('tick', scheduleRAFRerender);

    simulation.current.nodes([...simulationNodesMap.current.values()]);
  }, [setNodes]);

  useEffect(() => {
    const presentNodes = new Set();
    nodes.map((node) => {
      presentNodes.add(node.id);
      const d3node = simulationNodesMap.current.get(node.id);
      if (!d3node)
        simulationNodesMap.current.set(node.id, {
          id: node.id,
          x: node.position.x,
          y: node.position.y,
          width: node.measured?.width ?? DEFAULT_NODE_SIZE.width,
          height: node.measured?.height ?? DEFAULT_NODE_SIZE.height,
        });
      else {
        d3node.width = node.measured?.width ?? DEFAULT_NODE_SIZE.width;
        d3node.height = node.measured?.height ?? DEFAULT_NODE_SIZE.height;
      }
    });

    for (const id of simulationNodesMap.current.keys())
      if (!presentNodes.has(id)) simulationNodesMap.current.delete(id);

    simulation.current.nodes([...simulationNodesMap.current.values()]);
    simulation.current
      .force('link')
      .links(edges.map((e) => ({ source: e.source, target: e.target })));
    restart(0.25);
  }, [nodes, edges]);

  const restart = useCallback((alpha: number = 0.15) => {
    if (simulation.current.alpha() < simulation.current.alphaMin()) {
      simulation.current.alpha(alpha).restart();
    }
  }, []);

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

    d3node.fx = 0;
    d3node.fy = 0;
  }, []);

  return { onDrag, onDragStop, restart };
}

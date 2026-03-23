'use client';

import '@xyflow/react/dist/style.css';
import './graphBoard.css';
import './graphBoardCursors.css';
import './graphBoardEdges.css';
import {
  Background,
  Connection,
  ConnectionMode,
  Edge,
  Node,
  NodeAddChange,
  NodeTypes,
  Panel,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import React, { CSSProperties, useCallback, useEffect, useState } from 'react';
import useInternalUpdates from '@/app/lib/hooks/graphBoard/useInternalUpdates';
import useExternalUpdates from '@/app/lib/hooks/graphBoard/useExternalUpdates';
import ResetStageButton from '@/app/lib/components/board/resetStageButton';
import { useTheme } from 'next-themes';
import ExternalLinkNode from '@/app/lib/components/board/graph/nodes/externalLinkNode';
import useForcedLayout from '@/app/lib/hooks/graphBoard/useForcedLayout';
import GraphToolbar from '@/app/lib/components/board/graph/menu/graphToolbar';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';
import cursorGrab from '@/app/lib/components/svg/cursorGrab';
import cursorMove from '@/app/lib/components/svg/cursorMove';
import cursorPointer from '@/app/lib/components/svg/cursorPointer';
import CustomNode from '@/app/lib/components/board/graph/nodes/customNode';
import InternalLinkNode from '@/app/lib/components/board/graph/nodes/internalLinkNode';
import NodeLinkNode from '@/app/lib/components/board/graph/nodes/nodeLinkNode';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import debounce from 'lodash/debounce';
import { GNode } from '@/app/lib/types/definitions';

const GRID_SIZE = 16;
const NODE_TYPES: NodeTypes = {
  externalLinkNode: ExternalLinkNode as any,
  customNode: CustomNode as any,
  internalLinkNode: InternalLinkNode as any,
  nodeLinkNode: NodeLinkNode as any,
};

export default function GraphBoard() {
  const { resolvedTheme } = useTheme();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const { fitView, updateNode } = useReactFlow();
  const {
    activeTool,
    setActiveTool,
    toolCursor,
    createNewElement,
    deleteSelectedElements,
    onSelectionChange,
  } = useGraphBoardContext();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const { onNodeDrag, onSelectionDrag, onDragStop } = useForcedLayout(
    nodes,
    edges,
    updateNode,
  );

  const { onNodesChange, onEdgesChange, onEdgeUpdate } = useInternalUpdates({
    setNodes,
    setEdges,
  });
  useExternalUpdates({
    setNodes,
    setEdges,
  });

  useEffect(() => {
    setTheme((resolvedTheme as 'light' | 'dark') ?? 'light');
  }, [resolvedTheme]);

  const handleConnect = useCallback(
    (connection: Connection) => {
      const isDuplicate = edges.some(
        (edge) =>
          edge.source === connection.source &&
          edge.target === connection.target &&
          edge.sourceHandle === connection.sourceHandle &&
          edge.targetHandle === connection.targetHandle,
      );
      if (isDuplicate) return;

      onEdgesChange([
        {
          type: 'add',
          item: {
            ...connection,
            style: { strokeWidth: 1.5 },
            id: `${connection.source}-${connection.target}-${Date.now()}`,
            type: 'default',
          },
        },
      ]);
    },
    [edges, onEdgesChange],
  );
  const handleReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      const isDuplicate = edges.some(
        (edge) =>
          edge.id !== oldEdge.id &&
          edge.source === newConnection.source &&
          edge.target === newConnection.target &&
          edge.sourceHandle === newConnection.sourceHandle &&
          edge.targetHandle === newConnection.targetHandle,
      );
      if (isDuplicate) {
        onEdgesChange([{ type: 'remove', id: oldEdge.id }]);
        return;
      }

      onEdgesChange([
        { type: 'remove', id: oldEdge.id },
        {
          type: 'add',
          item: {
            ...oldEdge,
            ...newConnection,
            id: `${newConnection.source}-${newConnection.target}-${Date.now()}`,
          },
        },
      ]);
    },
    [edges, onEdgesChange],
  );

  const debouncedClearNodesData = useCallback(
    debounce((currentNodes: GNode[]) => {
      graphBoardStore.clearRemovedNodes(currentNodes);
    }, 512) as any,
    [],
  );

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const newElement = createNewElement(e, activeTool);
      if (newElement) {
        onNodesChange([{ type: 'add', item: newElement } as NodeAddChange]);
        graphBoardStore.updateNodeData(newElement.id, newElement.data, true);
        debouncedClearNodesData(nodes);
        setActiveTool(undefined);
      }
    },
    [activeTool, debouncedClearNodesData, setActiveTool],
  );

  return (
    <div
      data-testid="graph-board"
      style={
        {
          '--graph-board-grab-cursor': `url(${cursorGrab}) 12 12, auto`,
          '--graph-board-move-cursor': `url(${cursorMove}) 12 12, auto`,
          '--graph-board-pointer-cursor': `url(${cursorPointer}) 12 12, auto`,
          '--graph-board-cursor': toolCursor,
        } as CSSProperties
      }
      className="relative h-full w-full overflow-hidden"
    >
      <ReactFlow
        connectionMode={ConnectionMode.Loose}
        onNodeDrag={onNodeDrag}
        onSelectionDrag={onSelectionDrag}
        onNodeDragStop={onDragStop}
        onSelectionDragStop={onDragStop}
        nodes={nodes}
        onSelectionChange={onSelectionChange}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onReconnect={handleReconnect}
        fitView
        onDelete={deleteSelectedElements}
        onConnect={handleConnect}
        panOnDrag={[2]}
        onPaneClick={handleClick}
        selectionOnDrag
        colorMode={theme}
        reconnectRadius={16}
        selectionMode="partial"
        nodeTypes={NODE_TYPES}
        proOptions={{ hideAttribution: true }}
        fitViewOptions={{ maxZoom: 1 }}
      >
        <Background size={1} gap={GRID_SIZE} color="#71717a" />
        <Panel position="bottom-center" className="toolbar w-full sm:w-fit">
          <GraphToolbar onEdgeUpdate={onEdgeUpdate} />
        </Panel>
        <ResetStageButton
          callback={() => fitView({ duration: 300, maxZoom: 1 })}
        />
      </ReactFlow>
    </div>
  );
}

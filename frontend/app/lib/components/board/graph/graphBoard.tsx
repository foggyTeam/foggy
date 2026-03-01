'use client';

import '@xyflow/react/dist/style.css';
import './graphBoard.css';
import { observer } from 'mobx-react-lite';
import {
  Background,
  Connection,
  Edge,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import React, { useCallback, useEffect, useState } from 'react';
import useInternalUpdates from '@/app/lib/hooks/graphBoard/useInternalUpdates';
import useExternalUpdates from '@/app/lib/hooks/graphBoard/useExternalUpdates';
import ResetStageButton from '@/app/lib/components/board/resetStageButton';
import { useTheme } from 'next-themes';

const GRID_SIZE = 24;

const GraphBoard = observer(() => {
  const { resolvedTheme } = useTheme();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const { fitView } = useReactFlow();

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const { onNodesChange, onEdgesChange } = useInternalUpdates({
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
            id: `${connection.source}-${connection.target}-${Date.now()}`,
            type: 'default',
          },
        },
      ]);
    },
    [onEdgesChange],
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
            ...newConnection,
            id: `${newConnection.source}-${newConnection.target}-${Date.now()}`,
            type: 'default',
          },
        },
      ]);
    },
    [onEdgesChange],
  );

  return (
    <div
      data-testid="graph-board"
      className="relative h-full w-full overflow-hidden"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onReconnect={handleReconnect}
        fitView
        onConnect={handleConnect}
        panOnDrag={[2]}
        selectionOnDrag
        colorMode={theme}
        reconnectRadius={16}
        selectionMode="partial"
        proOptions={{ hideAttribution: true }}
        fitViewOptions={{ maxZoom: 1.2 }}
      >
        <Background size={1} gap={GRID_SIZE} color="#71717a" />
        <ResetStageButton
          callback={() => fitView({ duration: 300, maxZoom: 1 })}
        />
      </ReactFlow>
    </div>
  );
});

export default GraphBoard;

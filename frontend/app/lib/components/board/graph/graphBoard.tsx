'use client';

import '@xyflow/react/dist/style.css';
import './graphBoard.css';
import { observer } from 'mobx-react-lite';
import { Background, ReactFlow, useReactFlow } from '@xyflow/react';
import React, { useEffect, useState } from 'react';
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
        fitView
        panOnDrag={[2]}
        selectionOnDrag
        colorMode={theme}
        selectionMode="partial"
        proOptions={{ hideAttribution: true }}
        fitViewOptions={{ maxZoom: 1 }}
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

'use client';

// TODO: rethink all updates as internal ReactFlow state synced with MobX state

import '@xyflow/react/dist/style.css';
import './graphBoard.css';
import './graphBoardCursors.css';
import './graphBoardEdges.css';
import {
  Background,
  Connection,
  ConnectionMode,
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
import { GEdge, GNode } from '@/app/lib/types/definitions';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import settingsStore from '@/app/stores/settingsStore';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

const GRID_SIZE = 16;
const NODE_TYPES: NodeTypes = {
  externalLinkNode: ExternalLinkNode as any,
  customNode: CustomNode as any,
  internalLinkNode: InternalLinkNode as any,
  nodeLinkNode: NodeLinkNode as any,
};

const GraphBoardObserver = observer(() => {
  const isReady =
    graphBoardStore.boardNodes !== undefined &&
    graphBoardStore.boardEdges !== undefined;
  useEffect(() => {
    if (isReady) settingsStore.endLoading();
  }, [isReady]);
  if (!isReady) return null;

  return <GraphBoard />;
});

function GraphBoard() {
  const { resolvedTheme } = useTheme();
  const { isMobile } = useAdaptiveParams();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [initialNodes] = useState(() => toJS(graphBoardStore.boardNodes)!);
  const [initialEdges] = useState(() => toJS(graphBoardStore.boardEdges)!);

  const {
    activeTool,
    setActiveTool,
    toolCursor,
    createNewElement,
    deleteSelectedElements,
    onSelectionChange,
  } = useGraphBoardContext();
  const rf = useReactFlow();

  const { onNodeDrag, onSelectionDrag, onDragStop, syncD3 } = useForcedLayout(
    rf.getNodes,
    rf.updateNode,
    rf.setNodes,
    rf.getEdges,
  );

  const {
    onNodeAction,
    onEdgeAction,
    onNodeUpdate,
    onEdgeUpdate,
    emitSelectionChange,
  } = useInternalUpdates(
    rf.getNode,
    rf.updateNode,
    rf.addNodes,
    rf.getEdge,
    rf.updateEdge,
    rf.addEdges,
    rf.deleteElements,
  );
  useExternalUpdates(
    rf.updateNode,
    rf.addNodes,
    rf.updateEdge,
    rf.addEdges,
    rf.deleteElements,
    syncD3,
  );

  const debouncedClearNodesData = useCallback(
    debounce(() => {
      graphBoardStore.clearRemovedNodes(rf.getNodes() as GNode[]);
    }, 512) as any,
    [],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      const isDuplicate = rf
        .getEdges()
        .some(
          (edge) =>
            edge.source === connection.source &&
            edge.target === connection.target &&
            edge.sourceHandle === connection.sourceHandle &&
            edge.targetHandle === connection.targetHandle,
        );
      if (isDuplicate) return;

      onEdgeAction({
        type: 'add',
        newItem: {
          ...connection,
          style: { strokeWidth: 1.5 },
          id: `${connection.source}-${connection.target}-${Date.now()}`,
          type: 'default',
        } as GEdge,
      });
    },
    [onEdgeAction],
  );
  const handleReconnect = useCallback(
    (oldEdge: GEdge, newConnection: Connection) => {
      const isDuplicate = rf
        .getEdges()
        .some(
          (edge) =>
            edge.id !== oldEdge.id &&
            edge.source === newConnection.source &&
            edge.target === newConnection.target &&
            edge.sourceHandle === newConnection.sourceHandle &&
            edge.targetHandle === newConnection.targetHandle,
        );

      if (isDuplicate) return;

      onEdgeUpdate(oldEdge.id, {
        ...oldEdge,
        ...newConnection,
      } as GEdge);
    },
    [onEdgeUpdate],
  );

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const newElement = createNewElement(e, activeTool);
      if (!newElement) return;

      const success = graphBoardStore.updateNodeData(
        newElement.id,
        newElement.data,
        true,
      );
      if (success) {
        onNodeAction({ type: 'add', newItem: newElement });
      }

      debouncedClearNodesData();
      setActiveTool(undefined);
    },
    [activeTool, debouncedClearNodesData, setActiveTool, onNodeAction],
  );
  const handleNodeDrag = useCallback(
    (_event: MouseEvent, node: GNode) => {
      onNodeDrag(_event, node);
      onNodeUpdate(node.id, node);
    },
    [onNodeDrag, onNodeUpdate],
  );
  const handleNodeDragStop = useCallback(
    (_event: MouseEvent, node: GNode) => {
      onDragStop(_event, node);
      onNodeUpdate(node.id, node);
    },
    [onDragStop, onNodeUpdate],
  );
  const handleSelectionDragStop = useCallback(
    (_event: MouseEvent, nodes: GNode[]) => {
      onDragStop(_event, nodes);
      nodes.forEach((node) => onNodeUpdate(node.id, node));
    },
    [onDragStop, onNodeUpdate],
  );

  const handleSelectionChange = useCallback(
    (params: any) => {
      onSelectionChange(params);
      emitSelectionChange(params);
    },
    [onNodeUpdate, onEdgeUpdate, onSelectionChange, emitSelectionChange],
  );

  useEffect(() => {
    setTheme((resolvedTheme as 'light' | 'dark') ?? 'light');
  }, [resolvedTheme]);
  useEffect(() => {
    return () => debouncedClearNodesData.cancel();
  }, [debouncedClearNodesData]);

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
        onNodeDrag={handleNodeDrag}
        onSelectionDrag={onSelectionDrag}
        onNodeDragStop={handleNodeDragStop}
        onSelectionDragStop={handleSelectionDragStop}
        defaultNodes={initialNodes}
        defaultEdges={initialEdges}
        onSelectionChange={handleSelectionChange}
        onReconnect={handleReconnect}
        fitView
        onDelete={deleteSelectedElements}
        onConnect={handleConnect}
        panOnDrag={[2]}
        onPaneClick={handleClick}
        selectionOnDrag={!isMobile}
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
          callback={() => rf.fitView({ duration: 300, maxZoom: 1 })}
        />
      </ReactFlow>
    </div>
  );
}
export default GraphBoardObserver;

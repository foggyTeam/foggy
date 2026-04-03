'use client';

import '@xyflow/react/dist/style.css';
import './graphBoard.css';
import './graphBoardCursors.css';
import './graphBoardEdges.css';
import {
  Background,
  ConnectionMode,
  NodeTypes,
  Panel,
  ReactFlow,
  SelectionMode,
  useReactFlow,
} from '@xyflow/react';
import React, {
  CSSProperties,
  MouseEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import useInternalUpdates from '@/app/lib/hooks/graphBoard/useInternalUpdates';
import useExternalUpdates from '@/app/lib/hooks/graphBoard/useExternalUpdates';
import ResetStageButton from '@/app/lib/components/board/resetStageButton';
import { useTheme } from 'next-themes';
import ExternalLinkNode from '@/app/lib/components/board/graph/nodes/externalLinkNode';
import useForcedLayout from '@/app/lib/hooks/graphBoard/useForcedLayout';
import GraphToolbar from '@/app/lib/components/board/graph/menu/graphToolbar';
import {
  useGraphBoardContext,
  useGraphBoardSelection,
} from '@/app/lib/components/board/graph/graphBoardContext';
import cursorGrab from '@/app/lib/components/svg/cursorGrab';
import cursorMove from '@/app/lib/components/svg/cursorMove';
import cursorPointer from '@/app/lib/components/svg/cursorPointer';
import CustomNode from '@/app/lib/components/board/graph/nodes/customNode';
import InternalLinkNode from '@/app/lib/components/board/graph/nodes/internalLinkNode';
import NodeLinkNode from '@/app/lib/components/board/graph/nodes/nodeLinkNode';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import { GNode } from '@/app/lib/types/definitions';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import settingsStore from '@/app/stores/settingsStore';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import LockGraphButton from '@/app/lib/components/board/graph/lockGraphButton';

const GRID_SIZE = 16;

const NODE_TYPES: NodeTypes = {
  externalLinkNode: ExternalLinkNode as any,
  customNode: CustomNode as any,
  internalLinkNode: InternalLinkNode as any,
  nodeLinkNode: NodeLinkNode as any,
};

function GraphBoard() {
  const { resolvedTheme } = useTheme();
  const { isMobile } = useAdaptiveParams();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [initialNodes] = useState(() => toJS(graphBoardStore.boardNodes)!);
  const [initialEdges] = useState(() => toJS(graphBoardStore.boardEdges)!);

  const {
    toolCursor,
    deleteSelectedElements,
    allToolsDisabled,
    toolsDisabled,
  } = useGraphBoardContext();

  const { onSelectionChange } = useGraphBoardSelection();

  const { fitView } = useReactFlow();

  const { onNodeDrag, onSelectionDrag, onDragStop, syncD3 } = useForcedLayout();

  const {
    createNode,
    createEdge,
    reconnectEdge,
    onNodeUpdate,
    onEdgeUpdate,
    emitSelectionChange,
  } = useInternalUpdates();

  useExternalUpdates(syncD3);

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
      emitSelectionChange(params);
      onSelectionChange(params);
    },
    [onSelectionChange, emitSelectionChange],
  );

  useEffect(() => {
    setTheme((resolvedTheme as 'light' | 'dark') ?? 'light');
  }, [resolvedTheme]);

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
        nodeTypes={NODE_TYPES}
        defaultNodes={initialNodes}
        defaultEdges={initialEdges}
        onNodeDrag={handleNodeDrag}
        onSelectionDrag={onSelectionDrag}
        onNodeDragStop={handleNodeDragStop}
        onSelectionDragStop={handleSelectionDragStop}
        onSelectionChange={handleSelectionChange}
        onPaneClick={createNode}
        onConnect={createEdge}
        onReconnect={reconnectEdge}
        onDelete={deleteSelectedElements}
        panOnDrag={[2]}
        deleteKeyCode={allToolsDisabled ? null : ['Delete', 'Backspace', 'Del']}
        selectionOnDrag={!isMobile}
        colorMode={theme}
        reconnectRadius={16}
        selectionMode={SelectionMode.Partial}
        connectionMode={ConnectionMode.Loose}
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={{ maxZoom: 1 }}
        nodesDraggable={!allToolsDisabled}
        nodesFocusable={!(allToolsDisabled || toolsDisabled)}
        nodesConnectable={!(allToolsDisabled || toolsDisabled)}
        edgesFocusable={!(allToolsDisabled || toolsDisabled)}
        edgesReconnectable={!(allToolsDisabled || toolsDisabled)}
      >
        <Background size={1} gap={GRID_SIZE} color="#71717a" />
        <Panel position="bottom-center" className="toolbar w-full sm:w-fit">
          <GraphToolbar onEdgeUpdate={onEdgeUpdate} />
        </Panel>
        <LockGraphButton />
        <ResetStageButton
          callback={() => fitView({ duration: 300, maxZoom: 1 })}
        />
      </ReactFlow>
    </div>
  );
}

const MemoizedGraphBoard = React.memo(GraphBoard);

const GraphBoardObserver = observer(() => {
  const isReady =
    graphBoardStore.boardNodes !== undefined &&
    graphBoardStore.boardEdges !== undefined;
  useEffect(() => {
    if (isReady) settingsStore.endLoading();
  }, [isReady]);
  if (!isReady) return null;

  return <MemoizedGraphBoard />;
});
export default GraphBoardObserver;

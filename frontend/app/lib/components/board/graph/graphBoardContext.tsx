'use client';

import React, {
  createContext,
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { GEdge, GNode } from '@/app/lib/types/definitions';
import useGraphTool from '@/app/lib/hooks/graphBoard/useGraphTool';
import useGraphOperations from '@/app/lib/hooks/graphBoard/useGraphOperations';
import { Connection, useNodesInitialized, useReactFlow } from '@xyflow/react';
import { useSearchParams } from 'next/navigation';

export type GraphTool =
  | 'custom-node'
  | 'internal-link'
  | 'external-link'
  | 'node-link';
interface BoardContextProps {
  // TOOLS
  allToolsDisabled: boolean;
  toolsDisabled: boolean;
  activeTool: GraphTool | undefined;
  setActiveTool: Dispatch<SetStateAction<GraphTool | undefined>>;
  toolCursor: string;

  // SELECTION
  selectedElementsRef: RefObject<Set<string>>; // stores `{type}|{id}`
  /** @deprecated Use selectedEdgeId / hasSelection to avoid re-renders on every click */
  selectedElements: Set<string>; // stores `{type}|{id}`
  selectedEdgeId: string | null;
  hasSelection: boolean;
  onSelectionChange: (params: { nodes: any[]; edges: any[] }) => void;

  // OPERATIONS
  createNewElement: (
    e: MouseEvent,
    tool: GraphTool | undefined,
  ) => GNode | null;
  createNewEdge: (connection: Connection) => GEdge | null;
  updateElement: (
    elementId: GNode['id'],
    newAttrs: Partial<GNode['data']>,
  ) => void;
  deleteSelectedElements: () => void;

  // ADDITIONAL
  isDuplicatedEdge: (connection: Connection) => boolean;
  isGraphLocked: boolean;
  lockGraph: (lock: boolean) => void;

  // BOARD
  zoomNode: (nodeId: string) => void;
}

const BoardContext = createContext<BoardContextProps | undefined>(undefined);

export function GraphBoardProvider({ children }: { children: ReactNode }) {
  const query = useSearchParams();
  const initialized = useNodesInitialized();
  const navigated = useRef(false);
  const { fitView } = useReactFlow();

  // SELECTION
  const selectedElementsRef = useRef(new Set<string>());
  // Granular derived states instead of the full Set to minimise re-renders:
  // – toolsDisabled changes only when selection count crosses the 1-boundary
  // – selectedEdgeId changes only when the selected edge identity changes
  // – hasSelection changes only when going 0↔1+ elements
  const [toolsDisabled, setToolsDisabled] = useState(false);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [hasSelection, setHasSelection] = useState(false);

  const onSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: GNode[]; edges: GEdge[] }) => {
      const newSet = new Set<string>();
      nodes.forEach((node) => newSet.add(`node|${node.id}`));
      edges.forEach((edge) => newSet.add(`edge|${edge.id}`));

      selectedElementsRef.current = newSet;

      const newSize = newSet.size;

      setToolsDisabled((prev: boolean) => {
        const next = newSize === 1;
        return prev !== next ? next : prev;
      });

      setHasSelection((prev: boolean) => {
        const next = newSize > 0;
        return prev !== next ? next : prev;
      });

      // Derive selected edge id: only set when exactly one edge is selected
      let nextEdgeId: string | null = null;
      if (newSize === 1) {
        const entry = newSet.values().next().value as string;
        const [type, id] = entry.split('|');
        if (type === 'edge') nextEdgeId = id;
      }
      setSelectedEdgeId((prev: string | null) =>
        prev !== nextEdgeId ? nextEdgeId : prev,
      );
    },
    [],
  );

  // TOOLS
  const {
    activeTool,
    setActiveTool,
    allToolsDisabled,
    toolCursor,
    lockGraph,
    isGraphLocked,
  } = useGraphTool();

  // OPERATIONS
  const {
    createNewElement,
    createNewEdge,
    updateElement,
    deleteSelectedElements,
    isDuplicatedEdge,
  } = useGraphOperations(selectedElementsRef, allToolsDisabled);

  const zoomNode = useCallback(
    async (nodeId: string) => {
      await fitView({ maxZoom: 1, nodes: [{ id: nodeId }], duration: 500 });
    },
    [fitView],
  );

  useEffect(() => {
    if (navigated.current || !initialized) return;
    navigated.current = true;
    const nodeId = query.get('node_id');
    if (nodeId && initialized) zoomNode(nodeId);
  }, [initialized]);

  return (
    <BoardContext.Provider
      value={{
        // TOOLS
        activeTool,
        setActiveTool,
        toolCursor,
        allToolsDisabled,
        toolsDisabled,
        // SELECTION
        selectedElementsRef,
        selectedElements: selectedElementsRef.current,
        selectedEdgeId,
        hasSelection,
        onSelectionChange,
        // OPERATIONS
        createNewElement,
        updateElement,
        deleteSelectedElements,
        createNewEdge,
        // ADDITIONAL
        isDuplicatedEdge,
        lockGraph,
        isGraphLocked,
        // BOARD
        zoomNode,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export const useGraphBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error(
      'useGraphBoardContext must be used within a GraphBoardProvider',
    );
  }
  return context;
};

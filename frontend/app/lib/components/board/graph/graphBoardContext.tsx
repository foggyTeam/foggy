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
  selectedElements: Set<string>; // stores `{type}|{id}`
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
  const [selectedElements, setSelectedElements] = useState(new Set<string>());
  const onSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: GNode[]; edges: GEdge[] }) => {
      const newSet = new Set();

      nodes.forEach((node) => newSet.add(`node|${node.id}`));
      edges.forEach((edge) => newSet.add(`edge|${edge.id}`));

      selectedElementsRef.current = newSet;
      setSelectedElements(newSet);
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

  async function zoomNode(nodeId: string) {
    await fitView({ maxZoom: 1, nodes: [{ id: nodeId }], duration: 500 });
  }
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
        toolsDisabled: selectedElements.size === 1,
        // SELECTION
        selectedElementsRef,
        selectedElements,
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

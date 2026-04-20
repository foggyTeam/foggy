'use client';

import React, {
  createContext,
  Dispatch,
  MouseEvent,
  ReactNode,
  RefObject,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

interface StableContextProps {
  // TOOLS
  allToolsDisabled: boolean;
  toolsDisabled: boolean;
  activeTool: GraphTool | undefined;
  setActiveTool: Dispatch<SetStateAction<GraphTool | undefined>>;
  toolCursor: string;

  selectedElementsRef: RefObject<Set<string>>;

  // OPERATIONS
  createNewElement: (
    e: MouseEvent,
    tool: GraphTool | undefined,
  ) => GNode | null;
  createNewEdge: () => Partial<GEdge>;
  updateElement: (
    elementId: GNode['id'],
    newAttrs: Partial<GNode['data']>,
  ) => void;
  deleteNode: (id: GNode['id']) => void;
  deleteSelectedElements: () => void;

  // ADDITIONAL
  isDuplicatedEdge: (connection: Connection) => boolean;
  isGraphLocked: boolean;
  lockGraph: (lock: boolean) => void;

  // BOARD
  zoomNode: (nodeId: string) => void;
}

interface SelectionContextProps {
  selectedElements: Set<string>; // stores `{type}|{id}`
  onSelectionChange: (params: { nodes: any[]; edges: any[] }) => void;
}

const BoardContext = createContext<StableContextProps | undefined>(undefined);
const SelectionContext = createContext<SelectionContextProps | undefined>(
  undefined,
);

export function GraphBoardProvider({ children }: { children: ReactNode }) {
  const query = useSearchParams();
  const initialized = useNodesInitialized();
  const navigated = useRef(false);
  const { fitView } = useReactFlow();

  const selectedElementsRef = useRef(new Set<string>());
  const [selectedElements, setSelectedElements] = useState(new Set<string>());

  const onSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: GNode[]; edges: GEdge[] }) => {
      const newSet = new Set<string>();
      nodes.forEach((node) => newSet.add(`node|${node.id}`));
      edges.forEach((edge) => newSet.add(`edge|${edge.id}`));

      selectedElementsRef.current = newSet;
      setSelectedElements(newSet);
    },
    [],
  );

  const toolsDisabled = !!selectedElements.size;

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
    deleteNode,
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

  const boardContextValue = useMemo<StableContextProps>(
    () => ({
      activeTool,
      setActiveTool,
      toolCursor,
      allToolsDisabled,
      toolsDisabled,
      selectedElementsRef,
      createNewElement,
      updateElement,
      deleteSelectedElements,
      deleteNode,
      createNewEdge,
      isDuplicatedEdge,
      lockGraph,
      isGraphLocked,
      zoomNode,
    }),
    [
      activeTool,
      setActiveTool,
      toolCursor,
      allToolsDisabled,
      toolsDisabled,
      createNewElement,
      updateElement,
      deleteSelectedElements,
      createNewEdge,
      isDuplicatedEdge,
      lockGraph,
      isGraphLocked,
    ],
  );

  const selectionContextValue = useMemo<SelectionContextProps>(
    () => ({ selectedElements, onSelectionChange }),
    [selectedElements, onSelectionChange],
  );

  return (
    <BoardContext.Provider value={boardContextValue}>
      <SelectionContext.Provider value={selectionContextValue}>
        {children}
      </SelectionContext.Provider>
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

export const useGraphBoardSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error(
      'useGraphBoardSelection must be used within a GraphBoardProvider',
    );
  }
  return context;
};

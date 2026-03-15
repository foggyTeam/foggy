'use client';

import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import { GEdge, GNode } from '@/app/lib/types/definitions';
import debounce from 'lodash/debounce';
import useGraphTool from '@/app/lib/hooks/graphBoard/useGraphTool';
import useGraphOperations from '@/app/lib/hooks/graphBoard/useGraphOperations';

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
  selectedElements: (GNode | GEdge)[];
  onSelectionChange: (params: { nodes: any[]; edges: any[] }) => void;

  // OPERATIONS
  createNewElement: (
    e: MouseEvent,
    tool: GraphTool | undefined,
  ) => GNode | null;
  updateElement: (
    elementId: GNode['id'],
    newAttrs: Partial<GNode['data']>,
  ) => void;
  deleteSelectedElements: () => void;
}

const BoardContext = createContext<BoardContextProps | undefined>(undefined);

export const GraphBoardProvider = observer(
  ({ children }: { children: ReactNode }) => {
    // SELECTION
    const [selectedElements, setSelectedElements] = useState<(GNode | GEdge)[]>(
      [],
    );
    const onSelectionChange = useCallback(
      debounce(({ nodes, edges }: { nodes: GNode[]; edges: GEdge[] }) => {
        setSelectedElements([...edges, ...nodes]);
      }, 256) as any,
      [],
    );

    // TOOLS
    const { activeTool, setActiveTool, allToolsDisabled, toolCursor } =
      useGraphTool();

    // OPERATIONS
    const { createNewElement, updateElement, deleteSelectedElements } =
      useGraphOperations(selectedElements);

    return (
      <BoardContext.Provider
        value={{
          // TOOLS
          activeTool,
          setActiveTool,
          toolCursor,
          allToolsDisabled,
          toolsDisabled: !!(
            selectedElements.length === 1 && selectedElements[0]
          ),
          // SELECTION
          selectedElements,
          onSelectionChange,
          // OPERATIONS
          createNewElement,
          updateElement,
          deleteSelectedElements,
        }}
      >
        {children}
      </BoardContext.Provider>
    );
  },
);

export const useGraphBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error(
      'useGraphBoardContext must be used within a GraphBoardProvider',
    );
  }
  return context;
};

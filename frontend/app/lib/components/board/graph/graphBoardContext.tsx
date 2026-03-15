'use client';

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import projectsStore from '@/app/stores/projectsStore';
import cursorAdd from '@/app/lib/components/svg/cursorAdd';
import { useReactFlow } from '@xyflow/react';
import { GNode } from '@/app/lib/types/definitions';
import debounce from 'lodash/debounce';
import graphBoardStore from '@/app/stores/board/graphBoardStore';

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
  setActiveTool: (tool: GraphTool | undefined) => void;
  toolCursor: string;

  // OPERATIONS
  createNewElement: (
    e: MouseEvent,
    tool: GraphTool | undefined,
  ) => GNode | null;
  updateElement: (
    elementId: GNode['id'],
    newAttrs: Partial<GNode['data']>,
  ) => void;
}

const BoardContext = createContext<BoardContextProps | undefined>(undefined);

export const GraphBoardProvider = observer(
  ({ children }: { children: ReactNode }) => {
    const { screenToFlowPosition } = useReactFlow();

    // TOOLS
    const allToolsDisabled = projectsStore.myRole === 'reader';
    const [activeTool, setActiveTool] = useState<GraphTool | undefined>();
    const toolCursor = useMemo(() => {
      switch (activeTool) {
        case undefined:
          return 'default';

        default:
          return `url(${cursorAdd}) 12 12, auto`;
      }
    }, [activeTool]);

    // OPERATIONS
    const createNewElement = (
      e: MouseEvent,
      tool: GraphTool | undefined,
    ): GNode | null => {
      if (!tool) return null;

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      let newNode = {
        id: `${tool}-${Date.now().toString()}`,
        position: position,
        data: {},
        type: '',
      };
      switch (tool) {
        case 'custom-node':
          newNode.type = 'customNode';
          break;
        case 'internal-link':
          newNode.type = 'internalLinkNode';
          break;
        case 'external-link':
          newNode.type = 'externalLinkNode';
          break;
        case 'node-link':
          newNode.type = 'nodeLinkNode';
          break;
      }
      return newNode as GNode;
    };
    const updateElement = useCallback(
      debounce(
        (elementId: GNode['id'], newAttrs: Partial<GNode['data']>) =>
          graphBoardStore.updateNodeData(elementId, newAttrs),
        256,
      ) as any,
      [],
    );

    return (
      <BoardContext.Provider
        value={{
          allToolsDisabled,
          activeTool,
          setActiveTool,
          toolCursor,
          toolsDisabled: false,
          createNewElement,
          updateElement,
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

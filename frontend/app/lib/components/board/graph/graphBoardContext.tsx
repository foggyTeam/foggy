'use client';

import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import projectsStore from '@/app/stores/projectsStore';
import cursorAdd from '@/app/lib/components/svg/cursorAdd';
import { GBaseNode } from '@/app/lib/types/definitions';
import { useReactFlow } from '@xyflow/react';
import cursorGrab from '@/app/lib/components/svg/cursorGrab';

type GraphTool =
  | 'custom-node'
  | 'internal-link'
  | 'external-link'
  | 'node-link'
  | 'delete';
interface BoardContextProps {
  // TOOLS
  allToolsDisabled: boolean;
  toolsDisabled: boolean;
  activeTool: GraphTool | undefined;
  setActiveTool: (tool: GraphTool | undefined) => void;
  toolCursor: string;

  // OPERATIONS
  addElement: (element: GBaseNode) => void;
}

const BoardContext = createContext<BoardContextProps | undefined>(undefined);

export const GraphBoardProvider = observer(
  ({ children }: { children: ReactNode }) => {
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
    const addElement = (element: any) => {
      console.log(element);
    };

    return (
      <BoardContext.Provider
        value={{
          allToolsDisabled,
          activeTool,
          setActiveTool,
          toolCursor,
          toolsDisabled: false,
          addElement,
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

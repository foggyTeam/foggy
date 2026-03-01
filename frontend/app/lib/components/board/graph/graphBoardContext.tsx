'use client';

import React, { createContext, ReactNode, useContext } from 'react';
import { observer } from 'mobx-react-lite';

interface BoardContextProps {}

const BoardContext = createContext<BoardContextProps | undefined>(undefined);

export const GraphBoardProvider = observer(
  ({ children }: { children: ReactNode }) => {
    return <BoardContext.Provider value={{}}>{children}</BoardContext.Provider>;
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

'use client';

import React, { createContext, ReactNode, useContext } from 'react';

interface DocBoardContextProps {}

const BoardContext = createContext<DocBoardContextProps | undefined>(undefined);

export function DocBoardProvider({ children }: { children: ReactNode }) {
  return <BoardContext.Provider value={}>{children}</BoardContext.Provider>;
}

export const useDocBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error(
      'useDocBoardContext must be used within a DocBoardProvider',
    );
  }
  return context;
};

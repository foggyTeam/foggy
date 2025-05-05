import React, { createContext, useState, useContext, ReactNode } from 'react';
import { BoardElement } from '@/app/lib/types/definitions';

interface BoardContextProps {
  scale: number;
  setScale: (scale: number) => void;
  activeTool: string;
  setActiveTool: (tool: string) => void;
  selectedElements: BoardElement[];
  changeSelection: (elements: BoardElement[]) => void;
  isEditingText: boolean;
  setIsEditingText: (isEditing: boolean) => void;
}

const BoardContext = createContext<BoardContextProps | undefined>(undefined);

export const BoardProvider = ({ children }: { children: ReactNode }) => {
  const [scale, setScale] = useState(1);
  const [activeTool, setActiveTool] = useState('');
  const [selectedElements, changeSelection] = useState<BoardElement[]>([]);
  const [isEditingText, setIsEditingText] = useState(false);

  return (
    <BoardContext.Provider
      value={{
        scale,
        setScale,
        activeTool,
        setActiveTool,
        selectedElements,
        changeSelection,
        isEditingText,
        setIsEditingText,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  return context;
};

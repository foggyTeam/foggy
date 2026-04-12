'use client';

import React, {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useRef,
  useState,
} from 'react';
import QuillType from 'quill';

interface DocBoardContextProps {
  // ACTIVE BLOCK
  activeQuillRef: RefObject<QuillType>;

  // SELECTION
  selectionFormat: object;
  setSelectionFormat: (format: object) => void;
  setSavedSelection: (value: any) => void;
  saveSelection: () => void;
  restoreSelection: () => void;
}

const BoardContext = createContext<DocBoardContextProps | undefined>(undefined);

export function DocBoardProvider({ children }: { children: ReactNode }) {
  const activeQuillRef = useRef<any>(null);

  const [selectionFormat, setSelectionFormat] = useState<any>({});
  const [savedSelection, setSavedSelection] = useState<any>(null);

  const saveSelection = () => {
    const range = activeQuillRef.current?.getSelection();
    if (range) setSavedSelection(range);
  };

  const restoreSelection = () => {
    if (activeQuillRef.current && savedSelection) {
      requestAnimationFrame(() =>
        activeQuillRef.current.setSelection(savedSelection),
      );
    }
  };

  return (
    <BoardContext.Provider
      value={{
        // ACTIVE QUILL
        activeQuillRef,
        // SELECTION
        selectionFormat,
        setSelectionFormat,
        setSavedSelection,
        saveSelection,
        restoreSelection,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
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

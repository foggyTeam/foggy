'use client';

import React, {
  createContext,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import QuillType from 'quill';

interface DocBoardContextProps {
  // ACTIVE QUILL
  activeQuillRef: RefObject<QuillType | null>;

  // SELECTION
  onSelectionChange: () => void;
  selectionFormat: object;
  setSelectionFormat: (format: object) => void;
  setSavedSelection: (value: any) => void;
  saveSelection: () => void;
  restoreSelection: () => void;
}

const BoardContext = createContext<DocBoardContextProps | undefined>(undefined);

export function DocBoardProvider({ children }: { children: ReactNode }) {
  const activeQuillRef = useRef<QuillType | null>(null);

  const [selectionFormat, setSelectionFormat] = useState<any>({});
  const [savedSelection, setSavedSelection] = useState<any>(null);

  const saveSelection = () => {
    if (!activeQuillRef.current) return;

    const range = activeQuillRef.current.getSelection();
    if (range) setSavedSelection(range);
  };

  const restoreSelection = () => {
    if (!activeQuillRef.current) return;

    if (savedSelection) {
      requestAnimationFrame(() =>
        activeQuillRef.current?.setSelection(savedSelection),
      );
    }
  };

  const onSelectionChange = useCallback(() => {
    if (!activeQuillRef.current) return;
    if (activeQuillRef.current.getSelection()) {
      const format = activeQuillRef.current.getFormat();
      setSelectionFormat(format);
    }
  }, [setSelectionFormat]);

  return (
    <BoardContext.Provider
      value={{
        // ACTIVE QUILL
        activeQuillRef,
        // SELECTION
        onSelectionChange,
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

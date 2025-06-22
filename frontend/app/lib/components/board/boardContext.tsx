'use client';

import React, {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { BoardElement } from '@/app/lib/types/definitions';
import {
  handleEditText,
  TextEdit,
} from '@/app/lib/components/board/tools/drawingHandlers';
import { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';
import projectsStore from '@/app/stores/projectsStore';
import cursorEraser from '@/app/lib/components/svg/cursorEraser';
import cursorPencil from '@/app/lib/components/svg/cursorPencil';
import cursorAdd from '@/app/lib/components/svg/cursorAdd';
import cursorText from '@/app/lib/components/svg/cursorText';
import { observer } from 'mobx-react-lite';

interface BoardContextProps {
  stageRef: RefObject<null | Konva.Stage>;
  // ZOOM
  scale: number;
  setScale: (scale: number) => void;
  // TRANSFORMER
  transformAvailable: boolean;
  selectedElement: Konva.Shape;
  selectedElements: Konva.Shape[];
  changeSelection: (elements: BoardElement[]) => void;
  // TOOLS
  allToolsDisabled: boolean;
  toolsDisabled: boolean;
  activeTool: string;
  setActiveTool: (tool: string) => void;
  isEditingText: TextEdit | undefined;
  setIsEditingText: (isEditing: TextEdit) => void;
  textContent: string;
  setTextContent: (content: string) => void;
  // OPERATIONS
  addElement: (element: BoardElement) => void;
  updateElement: (id: string, newAttrs: Partial<BoardElement>) => void;
  removeElement: (id: string) => void;
  handleSelect: (event: KonvaEventObject<any>) => void;
  handleTextEdit: (e: KonvaEventObject<any>) => void;
  resetStage: () => void;
}

const BoardContext = createContext<BoardContextProps | undefined>(undefined);

export const BoardProvider = observer(
  ({ children }: { children: ReactNode }) => {
    const stageRef: RefObject<null | Konva.Stage> = useRef(null);
    // ZOOM
    const [scale, setScale] = useState(1);
    // TRANSFORMER
    const [selectedElements, changeSelection] = useState<any[]>([]);
    const selectedElementsRef = useRef(selectedElements);

    // TOOLS
    const allToolsDisabled = projectsStore.myRole === 'reader';
    const [activeTool, setActiveTool] = useState('');
    const [isEditingText, setIsEditingText] = useState<TextEdit>();
    const [textContent, setTextContent] = useState('');

    // STORE OPERATIONS
    const updateElement = (id: string, newAttrs: Partial<BoardElement>) => {
      projectsStore.updateElement(id, newAttrs);
    };
    const addElement = (newElement: BoardElement) => {
      projectsStore.addElement(newElement);
    };
    const removeElement = (id: string) => {
      if (selectedElements)
        changeSelection(
          selectedElements.filter((element) => element.attrs.id !== id),
        );
      projectsStore.removeElement(id);
    };

    // OPERATIONS
    const handleSelect = (e: KonvaEventObject<any>) => {
      if (activeTool || allToolsDisabled) return;

      e.cancelBubble = true;
      const target = e.target;

      if (target.parent)
        changeSelection((prevState) => {
          if (e.evt.ctrlKey || e.evt.metaKey || prevState.length === 0)
            return prevState.findIndex((el) => el._id === target._id) === -1
              ? [...prevState, target]
              : prevState.filter((v) => v._id !== target._id);

          return prevState.findIndex((el) => el._id === target._id) === -1
            ? [target]
            : [];
        });
      else {
        changeSelection([]);
        if (isEditingText)
          handleEditText({
            stageRef,
            target: target,
            updateElement,
            content: textContent,
            setContent: setTextContent,
            textEditing: isEditingText,
            setTextEditing: setIsEditingText,
          });
      }
    };
    const handleTextEdit = (e: KonvaEventObject<any>) => {
      if (!isEditingText) resetStage(true);
      handleEditText({
        stageRef,
        target: e.target,
        updateElement,
        content: textContent,
        setContent: setTextContent,
        textEditing: isEditingText,
        setTextEditing: setIsEditingText,
      });
    };

    const resetStage = (e: any = undefined) => {
      const onlyZoom = !(e instanceof Object);
      const stage = stageRef.current;
      if (stage) {
        if (onlyZoom) {
          setScale(1);
          stage.scale({ x: 1, y: 1 });
          stage.batchDraw();
        } else {
          stage.position({ x: 0, y: 0 });
          setScale(1);
          stage.scale({ x: 1, y: 1 });
          stage.batchDraw();
        }
      }
    };

    useEffect(() => {
      selectedElementsRef.current = selectedElements;
    }, [selectedElements]);

    useEffect(() => {
      const handleDelKey = (e: KeyboardEvent) => {
        if (e.key === 'Delete' && selectedElementsRef.current) {
          selectedElementsRef.current.forEach((element) => {
            removeElement(element.attrs.id);
          });
        }
      };

      window.addEventListener('keydown', handleDelKey);
      return () => {
        window.removeEventListener('keydown', handleDelKey);
      };
    }, []);

    useEffect(() => {
      const stage = stageRef.current?.getStage();
      if (activeTool && stage) {
        switch (activeTool) {
          case 'eraser':
            stage.container().style.cursor = `url(${cursorEraser}) 0 24, auto`;
            break;
          case 'pencil':
            stage.container().style.cursor = `url(${cursorPencil}) 0 24, auto`;
            break;
          case 'text':
            stage.container().style.cursor = `url(${cursorText}) 12 12, auto`;
            break;
          case '':
            stage.container().style.cursor = 'default';
            break;
          default:
            stage.container().style.cursor = `url(${cursorAdd}) 12 12, auto`;
        }

        return () => {
          if (stageRef.current) {
            const stage = stageRef.current?.getStage();
            stage.container().style.cursor = 'default';
          }
        };
      }
    }, [activeTool]);

    return (
      <BoardContext.Provider
        value={{
          stageRef,
          // ZOOM
          scale,
          setScale,
          // TRANSFORMER
          transformAvailable: !activeTool,
          selectedElement:
            selectedElements.length === 1 && !activeTool && selectedElements[0],
          selectedElements,
          changeSelection,
          // TOOLS
          allToolsDisabled,
          toolsDisabled: !!(
            selectedElements.length === 1 && selectedElements[0]
          ),
          activeTool,
          setActiveTool,
          isEditingText,
          setIsEditingText,
          textContent,
          setTextContent,
          // OPERATIONS
          addElement,
          updateElement,
          removeElement,
          handleSelect,
          handleTextEdit,
          resetStage,
        }}
      >
        {children}
      </BoardContext.Provider>
    );
  },
);

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  return context;
};

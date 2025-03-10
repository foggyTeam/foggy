import { action, makeAutoObservable, observable } from 'mobx';
import {
  Board,
  BoardElement,
  Project,
  TextElement,
} from '@/app/lib/types/definitions';
import UpdateTextElement from '@/app/lib/utils/updateTextElement';

const MAX_LAYER = 2;

class ProjectsStore {
  activeBoard: Board | undefined = undefined;
  activeProject: Project | undefined = new Project();
  allProjects: Project[] = [];

  constructor() {
    makeAutoObservable(this, {
      activeBoard: observable,
      activeProject: observable,
      allProjects: observable,
      addElement: action,
      updateElement: action,
      changeElementLayer: action,
      removeElement: action,
      setActiveBoard: action,
      setActiveProject: action,
      setAllProjects: action,
      addBoard: action,
      addProject: action,
    });
  }

  addElement = (newElement: BoardElement) => {
    if (this.activeBoard)
      this.activeBoard.layers[this.activeBoard?.layers.length - 1].push(
        newElement,
      );
  };
  updateElement = (id: string, newAttrs: Partial<BoardElement>) => {
    if (this.activeBoard) {
      this.activeBoard.layers = this.activeBoard.layers.map(
        (layer: BoardElement[]) =>
          layer.map((element) => {
            if (!(element.id === id)) return element;
            if (!(element.type === 'text'))
              return { ...element, ...newAttrs } as BoardElement;
            return UpdateTextElement(element, newAttrs as Partial<TextElement>);
          }),
      );
    }
  };
  changeElementLayer = (
    id: string,
    action: 'back' | 'forward' | 'bottom' | 'top',
  ): { layer: number; index: number } => {
    if (this.activeBoard) {
      let elementToMove: BoardElement | null = null;
      let currentLayerIndex: number = -1;

      this.activeBoard.layers = this.activeBoard.layers.map(
        (layer, layerIndex) => {
          const index = layer.findIndex((element) => element.id === id);
          if (index !== -1) {
            elementToMove = layer[index];
            currentLayerIndex = layerIndex;
            return layer.filter((_, i) => i !== index);
          }
          return layer;
        },
      );

      if (elementToMove) {
        switch (action) {
          case 'back':
            if (currentLayerIndex > 0) {
              this.activeBoard.layers[currentLayerIndex - 1].push(
                elementToMove,
              );
              return {
                layer: currentLayerIndex - 1,
                index:
                  this.activeBoard.layers[currentLayerIndex - 1].length - 1,
              };
            } else {
              this.activeBoard.layers[0].unshift(elementToMove);
              return { layer: currentLayerIndex - 1, index: 0 };
            }
          case 'forward':
            if (currentLayerIndex < MAX_LAYER) {
              this.activeBoard.layers[currentLayerIndex + 1].push(
                elementToMove,
              );
              return {
                layer: currentLayerIndex + 1,
                index:
                  this.activeBoard.layers[currentLayerIndex + 1].length - 1,
              };
            } else {
              this.activeBoard.layers[MAX_LAYER].push(elementToMove);
              return {
                layer: -2,
                index: -2,
              };
            }
          case 'bottom':
            this.activeBoard.layers[0].unshift(elementToMove);
            return { layer: 0, index: 0 };
          case 'top':
            this.activeBoard.layers[MAX_LAYER].push(elementToMove);
            return {
              layer: -2,
              index: -2,
            };
        }
      }
      return { layer: -1, index: -1 };
    }
  };
  removeElement = (id: string) => {
    if (this.activeBoard)
      this.activeBoard.layers = this.activeBoard.layers.map((layer) =>
        layer.filter((element) => element.id !== id),
      );
  };
  getElementLayer = (id: string): { layer: number; index: number } => {
    let currentIndex = { layer: -1, index: -1 };

    this.activeBoard?.layers.map((layer, layerIndex) => {
      const index = layer.findIndex((element) => element.id === id);
      if (index !== -1) {
        currentIndex.layer = layerIndex;
        currentIndex.index = index;
      }
    });

    return currentIndex;
  };

  setActiveBoard = (board: Board) => {
    this.activeBoard
      ? (this.activeBoard = { ...this.activeBoard, board })
      : (this.activeBoard = board);
  };
  setActiveProject = (id: string) => {
    this.activeProject = this.allProjects.find((project) => project.id == id);
  };
  setAllProjects = (projects: Project[]) => {
    this.allProjects = projects;
  };
  addBoard = (newBoard: Board) => {
    this.activeProject?.boards.push(newBoard);
  };
  addProject = (newProject: Project) => {
    this.allProjects.push(newProject);
  };
}

const projectsStore = new ProjectsStore();
export default projectsStore;

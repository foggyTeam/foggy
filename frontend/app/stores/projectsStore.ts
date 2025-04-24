import { action, makeAutoObservable, observable } from 'mobx';
import {
  Board,
  BoardElement,
  Project,
  ProjectSection,
  RawProject,
  TextElement,
} from '@/app/lib/types/definitions';
import UpdateTextElement from '@/app/lib/utils/updateTextElement';
import ConvertRawProject from '@/app/lib/utils/convertRawProject';

const MAX_LAYER = 2;

class ProjectsStore {
  activeBoard: Board | undefined = undefined;
  activeProject: Project | undefined = undefined;
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
      addProjectChild: action,
      addProject: action,
      updateProject: action,
      updateProjectChild: action,
      deleteProjectChild: action,
    });
  }

  addElement = (newElement: BoardElement) => {
    if (this.activeBoard?.layers)
      this.activeBoard.layers[this.activeBoard?.layers.length - 1].push(
        newElement,
      );
  };
  updateElement = (id: string, newAttrs: Partial<BoardElement>) => {
    if (this.activeBoard?.layers) {
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
    if (this.activeBoard?.layers) {
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
    }
    return { layer: -1, index: -1 };
  };
  removeElement = (id: string) => {
    if (this.activeBoard?.layers)
      this.activeBoard.layers = this.activeBoard.layers.map((layer) =>
        layer.filter((element) => element.id !== id),
      );
  };
  getElementLayer = (id: string): { layer: number; index: number } => {
    const currentIndex = { layer: -1, index: -1 };

    if (this.activeBoard?.layers)
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
    if (this.activeBoard) this.activeBoard = { ...this.activeBoard, ...board };
    else this.activeBoard = board;
  };
  setActiveProject = (project: RawProject) => {
    this.activeProject = ConvertRawProject(project);
  };
  setAllProjects = (projects: Project[]) => {
    this.allProjects = projects;
  };
  updateProject = (id: string, newAttrs: Partial<Project>) => {
    const projectIndex = this.allProjects.findIndex(
      (project) => project.id === id,
    );
    this.allProjects[projectIndex] = {
      ...this.allProjects[projectIndex],
      ...newAttrs,
    };
  };

  addProject = (newProject: Project) => {
    // TODO: make a post request and receive a project id
    this.allProjects.push(newProject);
  };
  addProjectChild = (
    parentSections: string[],
    child: ProjectSection | Board,
    isSection: boolean,
  ) => {
    if (!this.activeProject) return;

    let currentSection: Map<
      string,
      | ProjectSection
      | Pick<Board, 'id' | 'name' | 'sectionId' | 'type' | 'lastChange'>
    > = this.activeProject.sections;

    for (let i = 0; i < parentSections.length; i++) {
      const sectionId = parentSections[i];
      const nextSection = currentSection.get(sectionId);

      // если секция не найдена или структура некорректна
      if (!nextSection || !('children' in nextSection)) {
        console.error('Не удалось добавить элемент');
        return;
      }

      if (i === parentSections.length - 1) {
        if (!nextSection.children) nextSection.children = new Map();

        nextSection.children.set(child.id, child);
        if (isSection && 'parentId' in child)
          child.parentId = parentSections[parentSections.length - 1];
      } else currentSection = nextSection.children;
    }

    // добавление на верхний уровень
    if (parentSections.length === 0 && isSection && 'children' in child) {
      this.activeProject.sections.set(child.id, child);
      child.parentId = undefined;
    }
  };
  updateProjectChild = (
    parentSections: string[],
    id: string,
    newAttrs: Partial<ProjectSection | Board>,
  ): void => {
    if (!this.activeProject) return;

    let currentSection: Map<
      string,
      | ProjectSection
      | Pick<Board, 'id' | 'name' | 'sectionId' | 'type' | 'lastChange'>
    > = this.activeProject.sections;

    for (let i = 0; i < parentSections.length; i++) {
      const sectionId = parentSections[i];
      const nextSection = currentSection.get(sectionId);

      // если секция не найдена или структура некорректна
      if (!nextSection || !('children' in nextSection)) {
        console.error('Не удалось обновить элемент');
        return;
      }

      if (i === parentSections.length - 1) {
        const targetItem = nextSection.children.get(id);
        if (!targetItem) {
          console.error('Элемент не найден');
          return;
        }

        Object.assign(targetItem, newAttrs);
      } else currentSection = nextSection.children;
    }

    if (parentSections.length === 0) {
      const targetItem = this.activeProject.sections.get(id);
      if (!targetItem) {
        console.error('Элемент не найден');
        return;
      }

      Object.assign(targetItem, newAttrs);
    }
  };
  deleteProjectChild = (childId: string, parentSections: string[]) => {
    if (!this.activeProject) return;

    let currentSection: Map<
      string,
      | ProjectSection
      | Pick<Board, 'id' | 'name' | 'sectionId' | 'type' | 'lastChange'>
    > = this.activeProject.sections;

    for (let i = 0; i < parentSections.length; i++) {
      const sectionId = parentSections[i];
      const nextSection = currentSection.get(sectionId);

      // если секция не найдена или структура некорректна
      if (!nextSection || !('children' in nextSection)) {
        console.error('Не удалось добавить элемент');
        return;
      }

      if (i === parentSections.length - 1) {
        if (!nextSection.children) nextSection.children = new Map();

        nextSection.children.delete(childId);
      } else currentSection = nextSection.children;
    }

    // удаление с верхнего уровеня
    if (parentSections.length === 0)
      this.activeProject.sections.delete(childId);
  };
}

const projectsStore = new ProjectsStore();
export default projectsStore;

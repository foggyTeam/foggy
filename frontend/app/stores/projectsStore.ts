import { action, makeAutoObservable, observable } from 'mobx';
import {
  Board,
  BoardElement,
  BoardTypes,
  Project,
  ProjectMember,
  ProjectSection,
  RawProject,
  Role,
  TextElement,
} from '@/app/lib/types/definitions';
import UpdateTextElement from '@/app/lib/utils/updateTextElement';
import ConvertRawProject, {
  ConvertRawSection,
} from '@/app/lib/utils/convertRawProject';
import userStore from '@/app/stores/userStore';
import { Socket } from 'socket.io-client';
import openBoardSocketConnection, {
  socketAddEventListeners,
} from '@/app/lib/utils/boardSocketConnection';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';

class ProjectsStore {
  myRole: Role | undefined = undefined;

  boardWebsocket: Socket | null = null;

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
      revalidateActiveProject: action,
      setAllProjects: action,
      addProjectChild: action,
      insertProjectChild: action,
      addProject: action,
      updateProject: action,
      updateProjectChild: action,
      deleteProjectChild: action,
      updateProjectMember: action,
      removeProjectMember: action,
      activeBoardParentList: observable,
      getProjectChildParentList: action,
    });
  }

  connectSocket(boardId: string) {
    if (boardId && userStore.user) {
      this.boardWebsocket = openBoardSocketConnection(
        boardId,
        userStore.user.id,
      );

      if (this.boardWebsocket) socketAddEventListeners(this.boardWebsocket);
    } else
      addToast({
        severity: 'danger',
        title: settingsStore.t.toasts.socketConnectionError.title,
        description: settingsStore.t.toasts.socketConnectionError.description,
      });
  }
  disconnectSocket() {
    if (this.boardWebsocket) {
      this.boardWebsocket.disconnect();
      this.boardWebsocket = null;
    }
  }

  // BOARD
  addElement = (newElement: BoardElement, external?: boolean) => {
    if (this.activeBoard?.layers && this.boardWebsocket) {
      this.activeBoard.layers[this.activeBoard?.layers.length - 1].push(
        newElement,
      );
      if (!external) this.boardWebsocket.emit('addElement', newElement);
    }
  };
  updateElement = (
    id: string,
    newAttrs: Partial<BoardElement>,
    external?: boolean,
  ) => {
    if (this.activeBoard?.layers && this.boardWebsocket) {
      this.activeBoard.layers = this.activeBoard.layers.map(
        (layer: BoardElement[]) =>
          layer.map((element) => {
            if (!(element.id === id)) return element;
            if (!(element.type === 'text'))
              return { ...element, ...newAttrs } as BoardElement;

            return UpdateTextElement(element, newAttrs as Partial<TextElement>);
          }),
      );
      if (!external)
        this.boardWebsocket.emit('updateElement', { id, newAttrs });
    }
  };
  changeElementLayer = (
    id: string,
    action: 'back' | 'forward' | 'bottom' | 'top',
  ): { layer: number; index: number } => {
    if (!this.activeBoard?.layers || !this.boardWebsocket)
      return { layer: -1, index: -1 };

    const layers = this.activeBoard.layers;
    const position = this.getElementLayer(id);
    if (position.index < 0 || position.layer < 0) {
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.boardElementNotFound,
      });
      return { layer: -1, index: -1 };
    }

    const element: BoardElement = layers[position.layer][position.index];
    layers[position.layer].splice(position.index, 1);

    layers[position.layer] = [...layers[position.layer]];

    const maxMin = this.getMaxMinElementPositions();
    let firstNonEmptyLayer = maxMin.min.layer;
    let lastNonEmptyLayer = maxMin.max.layer;

    let targetLayer = position.layer;
    let targetIndex = position.index;

    switch (action) {
      case 'back': {
        if (position.layer === firstNonEmptyLayer && position.index === 0) {
          targetLayer = position.layer;
          targetIndex = 0;
          break;
        }
        if (position.index > 0) {
          targetIndex = position.index - 1;
        } else {
          let prevLayer = position.layer - 1;
          while (prevLayer >= 0 && layers[prevLayer].length === 0) prevLayer--;
          targetLayer = prevLayer;
          let len = layers[targetLayer].length;
          targetIndex = len > 0 ? len - 1 : 0;
        }
        break;
      }

      case 'forward': {
        if (
          position.layer === lastNonEmptyLayer &&
          position.index === layers[position.layer].length
        ) {
          targetLayer = position.layer;
          targetIndex = layers[position.layer].length;
          break;
        }
        if (position.index < layers[position.layer].length) {
          targetIndex = position.index + 1;
        } else {
          let nextLayer =
            position.layer < layers.length - 1
              ? position.layer + 1
              : position.layer;
          while (
            nextLayer < layers.length - 1 &&
            layers[nextLayer].length === 0
          )
            nextLayer++;
          targetLayer = nextLayer;
          targetIndex = layers[targetLayer].length > 0 ? 1 : 0;
        }
        break;
      }

      case 'bottom': {
        targetLayer = firstNonEmptyLayer;
        targetIndex = 0;
        break;
      }

      case 'top': {
        targetLayer = lastNonEmptyLayer;
        targetIndex = layers[lastNonEmptyLayer].length;
        break;
      }
    }

    layers[targetLayer].splice(targetIndex, 0, element);
    if (targetLayer !== position.layer)
      layers[targetLayer] = [...layers[targetLayer]];

    this.boardWebsocket.emit('changeElementLayer', {
      id: id,
      prevPosition: position,
      newPosition: { layer: targetLayer, index: targetIndex },
    });

    return { layer: targetLayer, index: targetIndex };
  };
  changeElementLayerSocket = (
    id: string,
    prevPosition: { layer: number; index: number },
    newPosition: { layer: number; index: number },
  ) => {
    if (!this.activeBoard) {
      addToast({
        severity: 'danger',
        title: settingsStore.t.toasts.globalError,
      });
      return;
    }
    if (
      prevPosition.layer == newPosition.layer &&
      prevPosition.index == newPosition.index
    )
      return;
    try {
      const element =
        this.activeBoard.layers[prevPosition.layer][prevPosition.index];

      this.activeBoard.layers[prevPosition.layer].splice(prevPosition.index, 1);
      this.activeBoard.layers[newPosition.layer].splice(
        newPosition.index,
        0,
        element,
      );
      this.activeBoard.layers[prevPosition.layer] = [
        ...this.activeBoard.layers[prevPosition.layer],
      ];
      this.activeBoard.layers[newPosition.layer] = [
        ...this.activeBoard.layers[newPosition.layer],
      ];
    } catch (error) {
      console.error('An error occured!');
    }
  };
  removeElement = (id: string, external?: boolean) => {
    if (this.activeBoard?.layers && this.boardWebsocket) {
      this.activeBoard.layers = this.activeBoard.layers.map((layer) =>
        layer.filter((element) => element.id !== id),
      );
      if (!external) this.boardWebsocket.emit('removeElement', id);
    }
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
  getMaxMinElementPositions = (): {
    max: { layer: number; index: number };
    min: { layer: number; index: number };
  } => {
    const layers = this.activeBoard?.layers;
    if (!layers)
      return { max: { layer: -1, index: -1 }, min: { layer: -1, index: -1 } };

    let firstNonEmptyLayer = layers.findIndex((l) => l.length > 0);
    if (firstNonEmptyLayer === -1) firstNonEmptyLayer = 0;
    let lastNonEmptyLayer =
      layers.length - 1 - [...layers].reverse().findIndex((l) => l.length > 0);
    if (lastNonEmptyLayer === layers.length)
      lastNonEmptyLayer = layers.length - 1;

    return {
      max: {
        layer: lastNonEmptyLayer,
        index: layers[lastNonEmptyLayer].length - 1,
      },
      min: { layer: firstNonEmptyLayer, index: 0 },
    };
  };

  setActiveBoard = (board: any | undefined) => {
    if (!board) {
      this.activeBoard = board;
      this.disconnectSocket();
    } else {
      this.activeBoard = {
        ...board,
        layers: board.layers.map((layer) => observable.array(layer)),
        lastChange: board.updatedAt,
        type: board.type.toUpperCase() as BoardTypes,
      } as Board;
      this.connectSocket(this.activeBoard.id || '');
    }
  };

  // PROJECT
  setActiveProject = (project: RawProject | null) => {
    if (!project) {
      this.activeProject = undefined;
      this.myRole = undefined;
      return;
    }
    this.activeProject = ConvertRawProject(project);
    this.myRole = this.activeProject.members?.find(
      (member) => member.id === userStore.user?.id,
    ).role;
  };
  revalidateActiveProject = (rawRevalidatedData: RawProject) => {
    if (!this.activeProject) return;
    const revalidatedData: Omit<Project, 'id' | 'sections' | 'favorite'> = {
      name: rawRevalidatedData.name,
      avatar: rawRevalidatedData.avatar,
      description: rawRevalidatedData.description,
      settings: rawRevalidatedData.settings,
      lastChange: rawRevalidatedData.updatedAt,
      members: rawRevalidatedData.members,
    };
    Object.assign(this.activeProject, revalidatedData);
  };
  setAllProjects = (projects: any[]) => {
    this.allProjects = projects.map((project) => {
      return {
        lastChange: project.updatedAt,
        members: project.members.map((member) => member as ProjectMember),
        ...project,
      } as Project;
    }) as Project[];
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
  addProject = async (newProject: Project) => {
    this.allProjects.push(newProject);
  };

  // PROJECT STRUCTURE
  getProjectChildParentList = (childId?: string): string[] => {
    if (!this.activeProject) return [];
    const searchId = childId || this.activeBoard?.id;
    if (!searchId) return [];

    function searchSection(
      searchId: string,
      section: ProjectSection,
      path: string[],
    ): string[] | undefined {
      if (searchId === section.id) return path;
      for (let child of section.children.values()) {
        if ('type' in child && child.id === searchId) {
          return [...path, section.id];
        }
        if (!('type' in child)) {
          const result = searchSection(searchId, child as ProjectSection, [
            ...path,
            section.id,
          ]);
          if (result) return result;
        }
      }
      return undefined;
    }

    for (const section of this.activeProject.sections.values()) {
      const result = searchSection(searchId, section, []);
      if (result) return result;
    }
    throw new Error('Project child with this id not found!');
  };
  activeBoardParentList: string[] = this.getProjectChildParentList() || [];
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
        nextSection.childrenNumber += 1;
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
        console.error('Не удалось удалить элемент');
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

    if (childId === this.activeBoard?.id) this.setActiveBoard(undefined);
  };
  getProjectChild = (
    childId: string | undefined,
    parentSections?: string[],
  ): Board | ProjectSection | Map<string, ProjectSection> => {
    if (!this.activeProject) return;
    if (childId === undefined && parentSections === undefined) return;

    parentSections =
      parentSections !== undefined
        ? parentSections
        : this.getProjectChildParentList(childId);

    let currentSection: Map<string, ProjectSection> =
      this.activeProject.sections;

    for (let i = 0; i < parentSections.length; i++) {
      const sectionId = parentSections[i];
      const nextSection = currentSection.get(sectionId);

      // если секция не найдена или структура некорректна
      if (!nextSection || !('children' in nextSection)) {
        throw new Error(
          'Project child with this id not found or parent list is invalid!',
        );
      }

      if (i === parentSections.length - 1) {
        if (nextSection.id === childId) return nextSection;

        if (nextSection.children) return nextSection.children.get(childId);
      } else currentSection = nextSection.children;
    }

    // поиск на верхнем уровне
    if (parentSections.length === 0) {
      if (childId) return this.activeProject.sections.get(childId);
      return currentSection;
    }

    throw new Error('Project child with this id not found!');
  };
  insertProjectChild = (
    parentSections: string[],
    rawSection: any,
    createParents: boolean = false,
  ) => {
    if (!this.activeProject) {
      console.error('Select a project!');
      return;
    }
    const child = ConvertRawSection(rawSection);
    // 1. Если parentSections пустой — вставляем в корень
    if (parentSections.length === 0) {
      // Перенос старых детей, если секция уже была в корне
      const oldSection = this.activeProject.sections.get(child.id) as
        | ProjectSection
        | undefined;
      if (oldSection && oldSection.children) {
        for (const [kidId, kid] of oldSection.children.entries()) {
          if (!child.children.has(kidId)) {
            child.children.set(kidId, kid);
          }
        }
      }
      // Вставляем или обновляем секцию в корне
      this.activeProject.sections.set(child.id, child);

      // Забрать "потеряшек" с корня, у которых parentId === child.id
      for (const [id, maybeChild] of Array.from(
        this.activeProject.sections.entries(),
      )) {
        if ('parentId' in maybeChild && maybeChild.parentId === child.id) {
          child.children.set(id, maybeChild);
          this.activeProject.sections.delete(id);
        }
      }
      return;
    }

    // 2. Иначе ищем родителя по parentSections (проходим путь)
    let current = this.activeProject.sections;
    let parentSection: ProjectSection | undefined = undefined;

    for (let idx = 0; idx < parentSections.length; ++idx) {
      const sectionId = parentSections[idx];
      let found = current.get(sectionId);

      if (!found || !('children' in found)) {
        if (createParents) {
          // Создаем новую "пустую" секцию
          const newParent: ProjectSection = {
            id: sectionId,
            parentId: idx === 0 ? undefined : parentSections[idx - 1],
            name: '—',
            childrenNumber: -1,
            children: observable.map(),
          };
          current.set(sectionId, newParent);
          found = newParent;
        } else {
          console.error('Родитель не найден');
          return;
        }
      }

      parentSection = found as ProjectSection;
      current = parentSection.children as Map<string, ProjectSection | Board>;
    }

    if (!parentSection) {
      console.error('Section not found!');
      return;
    }

    // 3. Переносим детей из старой версии секции (если была)
    const oldSection = parentSection.children.get(child.id) as
      | ProjectSection
      | undefined;
    if (oldSection && oldSection.children) {
      for (const [kidId, kid] of oldSection.children.entries()) {
        if (!child.children.has(kidId)) {
          child.children.set(kidId, kid);
        }
      }
    }

    // 4. Вставляем или обновляем секцию у родителя
    parentSection.children.set(child.id, child);

    // 5. Забираем "потеряшек" с текущего уровня, у которых parentId === child.id
    for (const [id, maybeChild] of Array.from(current.entries())) {
      if ('parentId' in maybeChild && maybeChild.parentId === child.id) {
        child.children.set(id as string, maybeChild);
        current.delete(id);
      }
    }
  };

  // PROJECT MEMBERS
  updateProjectMember = (
    memberId: string,
    newAttrs: Partial<ProjectMember>,
  ) => {
    if (this.activeProject) {
      const memberIndex = this.activeProject.members.findIndex(
        (member) => member.id === memberId,
      );
      if (memberIndex >= 0)
        this.activeProject.members[memberIndex] = {
          ...this.activeProject.members[memberIndex],
          ...newAttrs,
        };
    }
  };
  removeProjectMember = (memberId: string) => {
    if (this.activeProject) {
      this.activeProject.members = this.activeProject.members.filter(
        (member) => member.id !== memberId,
      );
    }
  };
}

const projectsStore = new ProjectsStore();
export default projectsStore;

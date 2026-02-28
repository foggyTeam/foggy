import { action, computed, makeAutoObservable, observable } from 'mobx';
import {
  Board,
  BoardTypes,
  Project,
  ProjectMember,
  ProjectSection,
  RawProject,
  Role,
} from '@/app/lib/types/definitions';
import ConvertRawProject, {
  ConvertRawSection,
} from '@/app/lib/utils/convertRawProject';
import userStore from '@/app/stores/userStore';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import boardStore from '@/app/stores/boardStore';

const RECENT_BOARDS_NUMBER = 4;

class ProjectsStore {
  myRole: Role | undefined = undefined;

  activeProject: Project | undefined = undefined;
  allProjects: Project[] = [];

  recentBoards: { url: string; name: string; type: BoardTypes }[] = [];

  constructor() {
    makeAutoObservable(this, {
      myRole: observable,
      recentBoards: observable,

      activeProject: observable,
      allProjects: observable,

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
      activeBoardParentList: computed,
      getProjectChildParentList: action,
    });
  }

  addRecentBoard = (
    projectId: string,
    sectionId: string,
    boardId: string,
    boardName: string,
    type: BoardTypes,
  ) => {
    if (!(projectId && sectionId && boardId)) return;
    const newURL = `/project/${projectId}/${sectionId}/${boardId}/${type.toLowerCase()}`;
    const newBoard = { url: newURL, name: boardName, type };

    let boards = [...this.recentBoards];
    const boardIndex = boards.findIndex((board) =>
      board.url.endsWith(`${boardId}/${type.toLowerCase()}`),
    );

    if (boardIndex !== -1) {
      boards[boardIndex] = newBoard;
    } else {
      boards = [...boards, newBoard].slice(-RECENT_BOARDS_NUMBER);
    }

    this.recentBoards = boards;
  };

  // PROJECT
  setActiveProject = (project: RawProject | null) => {
    if (!project) {
      this.activeProject = undefined;
      this.myRole = undefined;
      return;
    }
    this.activeProject = ConvertRawProject(project);
    this.myRole = this.activeProject.members.find(
      (member) => member.id === userStore.user?.id,
    )?.role;
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
        members: project.members.map((member: ProjectMember) => member),
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
    const searchId = childId || boardStore.activeBoard?.id;
    if (!searchId) return [];

    function searchSection(
      searchId: string,
      section: ProjectSection,
      path: string[],
    ): string[] | undefined {
      if (searchId === section.id) return path;
      for (const child of section.children.values()) {
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
  get activeBoardParentList() {
    if (!boardStore.activeBoard) return [];
    return this.getProjectChildParentList(boardStore.activeBoard.id) || [];
  }
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
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.project.noParent,
        });
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
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.project.updateSectionError,
        });
        return;
      }

      if (i === parentSections.length - 1) {
        const targetItem = nextSection.children.get(id);
        if (!targetItem) {
          addToast({
            color: 'danger',
            severity: 'danger',
            title: settingsStore.t.toasts.project.noParent,
          });
          return;
        }

        Object.assign(targetItem, newAttrs);
      } else currentSection = nextSection.children;
    }

    if (parentSections.length === 0) {
      const targetItem = this.activeProject.sections.get(id);
      if (!targetItem) {
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.project.sectionNotFound,
        });
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
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.project.deleteSectionError,
        });
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

    if (childId === boardStore.activeBoard?.id)
      boardStore.setActiveBoard(undefined);
  };
  getProjectChild = (
    childId: string | undefined,
    parentSections?: string[],
  ):
    | Pick<Board, 'id' | 'name' | 'sectionId' | 'type' | 'lastChange'>
    | ProjectSection
    | Map<string, ProjectSection>
    | undefined => {
    if (
      !this.activeProject ||
      (childId === undefined && parentSections === undefined)
    )
      return undefined;

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
        if (!childId) return undefined;
        if (nextSection.children) return nextSection.children.get(childId);
      } else
        currentSection = nextSection.children as Map<string, ProjectSection>;
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
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.project.noActive,
      });
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
          addToast({
            color: 'danger',
            severity: 'danger',
            title: settingsStore.t.toasts.project.noParent,
          });
          return;
        }
      }

      parentSection = found as ProjectSection;
      current = parentSection.children as Map<string, ProjectSection>;
    }

    if (!parentSection) {
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.project.sectionNotFound,
      });
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

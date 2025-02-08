import { action, makeAutoObservable, observable } from 'mobx';
import { Board, Project } from '@/app/lib/utils/definitions';

class ProjectsStore {
  activeBoard: Board | undefined = undefined;
  activeProject: Project | undefined = new Project();
  allProjects: Project[] = [];

  constructor() {
    makeAutoObservable(this, {
      activeBoard: observable,
      activeProject: observable,
      allProjects: observable,
      setActiveBoard: action,
      setActiveProject: action,
      setAllProjects: action,
      addBoard: action,
      addProject: action,
    });
  }

  setActiveBoard = (id: string) => {
    this.activeBoard = this.activeProject?.boards.find(
      (board: Board) => board.id == id,
    );
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

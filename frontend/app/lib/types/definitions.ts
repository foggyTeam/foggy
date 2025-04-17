/*The payload should contain the minimum, unique user data that'll be used in
subsequent requests, such as the user's ID, role, etc. It should not contain
personally identifiable information like phone number, email address, credit card
information, etc, or sensitive data like passwords.*/

// GENERAL
export type SessionPayload = {
  userId: string;
  expiresAt: Date;
};

export enum AvailableProviders {
  CREDENTIALS,
  GOOGLE,
  YANDEX,
}

export type AvailableLocales = 'en' | 'ru';

// BOARD
export enum BoardTypes {
  SIMPLE,
  GRAPH,
  TREE,
}

export type BoardElement =
  | RectElement
  | EllipseElement
  | LineElement
  | TextElement
  | MarkerElement;

interface BaseElement {
  id: string;
  type: string;
  draggable: boolean;
  dragDistance: 4;
  x: number;
  y: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface RectElement extends BaseElement {
  type: 'rect';
  cornerRadius: number;
  width: number;
  height: number;
}

export interface EllipseElement extends BaseElement {
  type: 'ellipse';
  width: number;
  height: number;
}

export interface TextElement extends BaseElement {
  // basically it is a Konva.image
  type: 'text';
  svg: string;
  content: string;
  cornerRadius: number;
  width: number;
  height: number;
}

export interface LineElement extends BaseElement {
  type: 'line';
  points: number[];
  width: number;
}

export interface MarkerElement extends BaseElement {
  type: 'marker';
  points: number[];
  width: number;
  opacity: number;
}

export class BoardType {
  projectId: string;
  section: string;
  id: string;
  name: string;
  type: BoardTypes = BoardTypes.SIMPLE;
  layers: BoardElement[][] = [[], [], []];
  lastChange: string;
}

// PROJECT
export class Project {
  constructor(params: {
    id: string;
    name?: string;
    creator: Partial<ProjectMember>;
    avatar?: string;
    description?: string;
    settings?: ProjectSettings;
    lastChange?: string;
  }) {
    if (params?.id) this.id = params.id;
    if (params?.creator)
      this.members = [
        {
          role: 'owner',
          id: params.creator.id,
          nickname: params.creator.nickname,
          avatar: params.creator.avatar,
        } as ProjectMember,
      ];
    if (params?.name) this.name = params.name;
    if (params?.avatar) this.avatar = params.avatar;
    if (params?.description) this.description = params.description;
    if (params?.settings) this.settings = params.settings;
    if (params?.lastChange) this.lastChange = params.lastChange;
  }

  id: string = '';
  name: string = 'unknown';
  avatar: string = '';
  description: string = '';
  settings: ProjectSettings = new ProjectSettings();
  favorite: boolean = false;
  members: ProjectMember[] = [];
  boards: BoardType[] = [];
  lastChange: string = new Date().toISOString();
}

export class ProjectSettings {
  allowRequests: boolean = true;
  isPublic: boolean = false;
  memberListIsPublic: boolean = true;
}

export type ProjectRole = TeamRole & 'team';

class Member {
  id: string;
  nickname: string;
  avatar?: string;
}
export class ProjectMember extends Member {
  role: ProjectRole;
}

// TEAM
export class Team {
  id: string = '';
  name: string = 'unknown';
  avatar: string = '';
  members: TeamMember[] = [];
  projects: Project[] = [];
}
export type TeamRole = 'owner' | 'admin' | 'editor' | 'reader';

export class TeamMember extends Member {
  role: TeamRole;
}

// FILTERS
export class FilterSet {
  nickname: Set<string> = new Set();
  team: Set<string> = new Set();
  role: Set<ProjectRole> = new Set();
  lastChange: string = '';
}

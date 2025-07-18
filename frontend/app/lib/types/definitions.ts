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
export type BoardTypes = 'SIMPLE' | 'GRAPH' | 'TREE';

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
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface RectElement extends BaseElement {
  type: 'rect';
  cornerRadius: number;
}

export interface EllipseElement extends BaseElement {
  type: 'ellipse';
}

export interface TextElement extends BaseElement {
  // basically it is a Konva.image
  type: 'text';
  svg: string;
  content: string;
  cornerRadius: number;
}

export interface LineElement extends BaseElement {
  type: 'line';
  points: number[];
  tension: number;
  lineJoin: 'miter' | 'round' | 'bevel';
  lineCap: 'butt' | 'round' | 'square';
}

export interface MarkerElement extends BaseElement {
  type: 'marker';
  points: number[];
  opacity: number;
}

export interface Board {
  id: string;
  name: string;
  type: BoardTypes;
  layers: BoardElement[][];
  sectionId: string;
  lastChange: string;
}

// PROJECT
export interface Project {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  favorite?: boolean;
  members: ProjectMember[];
  sections: Map<string, ProjectSection>;
  settings: ProjectSettings;
  lastChange: string;
}

export interface RawProject
  extends Omit<Project, 'sections' | 'members' | 'lastChange'> {
  members: any[];
  updatedAt: string;
  sections: any[];
}

export interface ProjectSection {
  id: string;
  parentId?: string;
  name: string;
  childrenNumber: number;
  children: Map<
    string,
    | ProjectSection
    | Pick<Board, 'id' | 'name' | 'sectionId' | 'type' | 'lastChange'>
  >;
}

export class ProjectSettings {
  allowRequests: boolean = true;
  isPublic: boolean = false;
  memberListIsPublic: boolean = true;
}

export interface ProjectMember extends TeamMember {
  team?: string;
  teamId?: string;
}

export type ProjectElementTypes = BoardTypes | 'SECTION';

// TEAM
export interface Team {
  id: string;
  name: string;
  avatar?: string;
  members: TeamMember[];
  projects: Project[];
}

export type Role = 'owner' | 'admin' | 'editor' | 'reader';

export interface TeamMember {
  id: string;
  nickname: string;
  avatar?: string;
  role: Role;
}

// FILTERS
export class FilterSet {
  nickname: Set<string> = new Set();
  team: Set<string> = new Set();
  role: Set<Role> = new Set();
  lastChange: string = '';
}

// NOTIFICATIONS
export type NotificationTarget = {
  type: 'PROJECT' | 'TEAM';
  id: string;
  name: string;
  avatar?: string;
};
export type NotificationType =
  | 'PROJECT_INVITE'
  | 'TEAM_INVITE'
  | 'PROJECT_JOIN_REQUEST'
  | 'PROJECT_JOIN_ACCEPTED'
  | 'PROJECT_JOIN_REJECTED'
  | 'TEAM_JOIN_REQUEST'
  | 'TEAM_JOIN_ACCEPTED'
  | 'TEAM_JOIN_REJECTED'
  | 'PROJECT_MEMBER_ADDED'
  | 'TEAM_MEMBER_ADDED';

export interface Notification {
  id: string;
  type: NotificationType;
  initiator: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  target: NotificationTarget;
  metadata: {
    role: Role;
    customMessage?: string;
    expiresAt?: string;
    inviterId?: string;
  };
  createdAt: string;
}

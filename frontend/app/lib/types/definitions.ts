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

export class Board {
  projectId: string;
  section: string;
  id: string;
  name: string;
  type: BoardTypes = BoardTypes.SIMPLE;
  layers: BoardElement[][] = [[], [], [], [], []];
  lastChange: string;
}

// PROJECT
export class Project {
  id: string = '';
  name: string = 'unknown';
  avatar: string = '';
  description: string = '';
  favorite: boolean = false;
  members: ProjectMember[] = [];
  boards: Board[] = [];
  lastChange: string = '';
}

export type ProjectRole = TeamRole & {
  team;
};
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
export type TeamRole = {
  owner;
  admin;
  editor;
  reader;
};
export class TeamMember extends Member {
  role: TeamRole;
}

// FILTERS
export class FilterObject {
  field: 'nickname' | 'name' | 'team' | 'role' | 'lastChange';
  referenceValue: string;
}

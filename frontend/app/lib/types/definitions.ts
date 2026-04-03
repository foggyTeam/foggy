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

export interface RawProject extends Omit<
  Project,
  'sections' | 'members' | 'lastChange'
> {
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
  settings: TeamSettings;
  members: TeamMember[];
  projects: Project[];
}

export interface RawTeam extends Omit<Team, 'id' | 'members' | 'projects'> {
  id: string;
  members: TeamMember[];
  projects: any[];
}

export type Role = 'owner' | 'admin' | 'editor' | 'reader';

export class TeamSettings {
  allowRequests: boolean = true;
  memberListIsPublic: boolean = true;
  projectListIsPublic: boolean = true;
}

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

// BOARDS
export type BoardTypes = 'SIMPLE' | 'GRAPH' | 'DOC';
export type Board = SimpleBoard | GraphBoard;

interface BaseBoard {
  id: string;
  name: string;
  type: BoardTypes;
  sectionId: string;
  lastChange: string;
}
export interface SimpleBoard extends BaseBoard {
  type: 'SIMPLE';
  layers: SBoardElement[][];
}

export interface GraphBoard extends BaseBoard {
  type: 'GRAPH';
  graphNodes: GNode[];
  graphEdges: GEdge[];
}

// SIMPLE BOARD
export type SBoardElement =
  | RectElement
  | EllipseElement
  | LineElement
  | TextElement;

interface SBaseElement {
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
export interface RectElement extends SBaseElement {
  type: 'rect';
  cornerRadius: number;
}
export interface EllipseElement extends SBaseElement {
  type: 'ellipse';
}
export interface TextElement extends SBaseElement {
  // basically it is a Konva.image
  type: 'text';
  svg: string;
  content: string;
  cornerRadius: number;
}
export interface LineElement extends SBaseElement {
  type: 'line';
  points: number[];
  tension: number;
  lineJoin: 'miter' | 'round' | 'bevel';
  lineCap: 'butt' | 'round' | 'square';
}

// GRAPH BOARD
import type { Edge, Handle, MarkerType, Node } from '@xyflow/react';

export interface GBaseNode extends Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  handles?: GNodeHandle[];
}

export interface GCustomNode extends GBaseNode {
  type: 'customNode';
  data: {
    title?: string;
    description?: string;
    shape: 'rect' | 'circle' | 'diamond' | 'triangle' | 'pentagon';
    color?: string;
    align: 'start' | 'center' | 'end';
  };
}

export interface GExternalLinkNode extends GBaseNode {
  type: 'externalLinkNode';
  data: {
    url?: string;
    thumbnailUrl?: string;
    favicon?: string;
    domain?: string;
    description?: string;
  };
}

export interface GInternalLinkNode extends GBaseNode {
  type: 'internalLinkNode';
  data: {
    element?: {
      type: ProjectElementTypes;
      title: string;
      path: string[];
    };
  };
}

export interface GNodeLinkNode extends GBaseNode {
  type: 'nodeLinkNode';
  data: {
    title?: string;
    url?: string;
    nodeId?: string;
  };
}

export type GNode =
  | GCustomNode
  | GExternalLinkNode
  | GInternalLinkNode
  | GNodeLinkNode;

interface GNodeHandle extends Handle {
  id?: string | null;
  nodeId: string;
  x: number;
  y: number;
  type: 'source' | 'target';
}

export interface GEdge extends Edge {
  id: string;
  type: 'default' | 'smoothstep' | 'straight' | 'step' | 'simplebezier';
  source: string; // source node id
  target: string; // target node id
  sourceHandle: string; // source node handle id
  targetHandle: string; // target node handle id
  label?: string;
  style?: {
    stroke?: string;
    strokeWidth?: number;
    strokeLinecap?: 'butt' | 'round' | 'square';
    strokeDasharray?: string;
  };
  animated?: boolean;
  markerStart?: {
    type: MarkerType;
    width: 20;
    strokeWidth: 1.5 | 2;
    color: string;
  };
  markerEnd?: {
    type: MarkerType;
    width: 20;
    strokeWidth: 1.5 | 2;
    color: string;
  };
}

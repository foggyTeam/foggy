/*The payload should contain the minimum, unique user data that'll be used in
subsequent requests, such as the user's ID, role, etc. It should not contain
personally identifiable information like phone number, email address, credit card
information, etc, or sensitive data like passwords.*/
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
  type: 'text';
  text: string;
  fontSize: number;
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

export interface Board {
  projectId: string;
  section: string;
  id: string;
  name: string;
  type: BoardTypes;
  layers: BoardElement[][];
  lastChange: string;
}

export class Project {
  id: string = '';
  name: string = 'unknown';
  boards: Board[] = [];
  lastChange: string = '';
}

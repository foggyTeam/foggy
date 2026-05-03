import 'server-only';
import { Board, BoardTypes, Project } from '@/app/lib/types/definitions';

// TS-адаптированные типы Go-моделей из AI Service.

// COMMON REQUEST/RESPONSE TYPES
export interface AiSummarizeArgs {
  boardId: Board['id'];
  imageUrl: string;
}
export interface AiStructurizeArgs {
  boardId: Board['id'];
  imageUrl: string;
  projectId: Project['id'];
}
export interface AiGenerateTemplateArgs {
  boardId: Board['id'];
  boardName: string;
  boardType: BoardTypes;
  prompt?: string;
  requestId?: string; // DirectProviderOnly: request id to receive job results
}

// BOARD ELEMENTS
/** Simple board element */
export interface AiElement {
  id: string;
  type: string; // 'rectangle' | 'text' | 'ellipse' | 'line'
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  // text elements
  content?: string;
  // rectangle elements
  cornerRadius?: number;
  // line elements
  points?: number[];
  tension?: number;
}

/** Graph board element */
export interface AiGraphElement {
  type: string;
  title?: string;
  path?: string[];
}

export interface AiGNode {
  id: string;
  type?: string;
  data: AiGNodeData;
}

export interface AiGNodeData {
  title?: string;
  description?: string;
  url?: string;
  element?: AiGraphElement;
}

export interface AiGEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export type AiBoardType = 'simple' | 'graph';

export interface AiBoard {
  boardId: string;
  imageUrl?: string;
  elements?: AiElement[];
  graphNodes?: AiGNode[];
  graphEdges?: AiGEdge[];
}

// FILE TREE
export interface AiFile {
  name: string;
  type: 'section' | 'doc' | 'graph' | 'simple';
  children?: AiFile[];
}

// REQUEST TYPES
export interface AiSummarizeRequest {
  requestId?: string;
  userId: string;
  requestType?: 'summarize';
  board: AiBoard;
}

export interface AiStructurizeRequest {
  requestId?: string;
  userId: string;
  requestType?: 'structurize';
  board: AiBoard;
  file: AiFile;
}

export interface AiGenerateTemplateRequest {
  requestId?: string;
  userId: string;
  requestType?: 'generateTemplate';
  boardId: string;
  boardType: AiBoardType;
  prompt: string;
}

export interface AiIncrementalRequest {
  requestId?: string;
  userId: string;
  requestType?: 'incremental';
  boardId: string;
  changes: AiElementChange[];
  fullBoard?: AiBoard;
  isFullRescan?: boolean;
}

export interface AiElementChange {
  elementId: string;
  changeType: 'added' | 'modified' | 'deleted';
  oldElement?: AiElement;
  newElement?: AiElement;
}

// RESPONSE TYPES
export interface AiText {
  id?: string;
  type?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  content: string;
  fill?: string;
}

export interface AiSummarizeResponse {
  requestId: string;
  userId: string;
  requestType: string;
  text: AiText;
}

export interface AiStructurizeResponse {
  requestId: string;
  userId: string;
  requestType: string;
  file: AiFile;
  aiTreeResponse?: string;
}

export interface AiGenerateTemplateResponse {
  requestId: string;
  userId: string;
  requestType: string;
  board: AiBoard;
}

export interface AiIncrementalResponse {
  requestId: string;
  userId: string;
  requestType: string;
  globalSummary: string;
  keyConcepts: string[];
  updatedRegions: string[];
  isFullRescan: boolean;
}

// AI SERVICE JOBS
export type AiJobStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'aborted';

export interface AiJob {
  id: string;
  status: AiJobStatus;
  createdAt: number;
  retries: number;
}

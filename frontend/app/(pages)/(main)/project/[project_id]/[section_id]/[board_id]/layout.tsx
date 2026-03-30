import BoardLoader from '@/app/lib/components/dataLoaders/boardLoader';
import React from 'react';
import {
  GetBoard,
  GetSection,
} from '@/app/lib/server/actions/projectServerActions';
import { notFound } from 'next/navigation';
import BoardLoadingCard from '@/app/lib/components/board/boardLoadingCard';
import { GraphBoard } from '@/app/lib/types/definitions';

interface BoardLayoutProps {
  project_id: string;
  section_id: string;
  board_id: string;
}

const GraphMockData: Pick<GraphBoard, 'graphEdges' | 'graphNodes'> = {
  graphNodes: [
    {
      id: 'frontend',
      type: 'customNode',
      position: { x: 0, y: 0 },
      data: {
        title: 'Frontend',
        description: 'Next.js 15 · React · MobX · HeroUI',
        shape: 'rect',
        color: '#c7d2fe',
        align: 'start',
      },
    },
    {
      id: 'graph-board',
      type: 'customNode',
      position: { x: -200, y: 200 },
      data: {
        title: 'Graph Board',
        description: 'ReactFlow + D3 force layout · real-time collaboration',
        shape: 'rect',
        color: '#ddd6fe',
        align: 'start',
      },
    },
    {
      id: 'simple-board',
      type: 'customNode',
      position: { x: 200, y: 200 },
      data: {
        title: 'Simple Board',
        description: 'Konva.js · layered canvas',
        shape: 'rect',
        color: '#ddd6fe',
        align: 'start',
      },
    },

    {
      id: 'backend',
      type: 'customNode',
      position: { x: 600, y: 0 },
      data: {
        title: 'Backend',
        description: 'NestJS · REST + WebSockets',
        shape: 'rect',
        color: '#a7f3d0',
        align: 'start',
      },
    },
    {
      id: 'ws-gateway',
      type: 'customNode',
      position: { x: 500, y: 200 },
      data: {
        title: 'WS Gateway',
        description: 'Socket.io · nodesUpdate · edgesUpdate · nodeDataUpdate',
        shape: 'rect',
        color: '#d1fae5',
        align: 'start',
      },
    },
    {
      id: 'auth',
      type: 'customNode',
      position: { x: 750, y: 200 },
      data: {
        title: 'Auth',
        description: 'NextAuth · JWT · Google · Yandex',
        shape: 'rect',
        color: '#d1fae5',
        align: 'start',
      },
    },

    {
      id: 'db',
      type: 'customNode',
      position: { x: 600, y: 420 },
      data: {
        title: 'Database',
        description: 'MongoDB',
        shape: 'circle',
        color: '#fde68a',
        align: 'center',
      },
    },

    {
      id: 'decision-roles',
      type: 'customNode',
      position: { x: 300, y: -180 },
      data: {
        title: 'Роли: owner / admin / editor / reader',
        description: 'reader — только чтение, lock-режим для всех',
        shape: 'diamond',
        color: '#fecdd3',
        align: 'center',
      },
    },
    {
      id: 'decision-collab',
      type: 'customNode',
      position: { x: 0, y: -180 },
      data: {
        title: 'Коллаборация',
        description: 'last-write-wins · без OT на старте',
        shape: 'diamond',
        color: '#fecdd3',
        align: 'center',
      },
    },

    {
      id: 'link-xyflow',
      type: 'externalLinkNode',
      position: { x: -400, y: 420 },
      data: {
        url: 'https://reactflow.dev',
        domain: 'reactflow.dev',
        favicon: 'https://reactflow.dev/favicon.ico',
        thumbnailUrl: '',
        description: 'Документация ReactFlow — handles, nodes, edges',
      },
    },
    {
      id: 'link-heroui',
      type: 'externalLinkNode',
      position: { x: -120, y: 420 },
      data: {
        url: 'https://heroui.com',
        domain: 'heroui.com',
        favicon: 'https://heroui.com/favicon.ico',
        thumbnailUrl: '',
        description: 'Компонентная библиотека — Popover, Input, Button…',
      },
    },

    {
      id: 'ilink-graph-section',
      type: 'internalLinkNode',
      position: { x: 950, y: 420 },
      data: {
        element: {
          type: 'SECTION',
          title: 'Graph Board',
          path: ['section-graph-id'],
        },
      },
    },

    {
      id: 'nodelink-ws',
      type: 'nodeLinkNode',
      position: { x: 950, y: 200 },
      data: {
        title: 'Подробнее: WS Gateway',
        nodeId: 'ws-gateway',
      },
    },
  ],

  graphEdges: [
    {
      id: 'e-fe-graph',
      type: 'smoothstep',
      source: 'frontend',
      sourceHandle: 'bottom-source',
      target: 'graph-board',
      targetHandle: 'top-target',
      style: { strokeWidth: 1.5, stroke: '#ddd6fe' },
    },
    {
      id: 'e-fe-simple',
      type: 'smoothstep',
      source: 'frontend',
      sourceHandle: 'bottom-source',
      target: 'simple-board',
      targetHandle: 'top-target',
      style: { strokeWidth: 1.5, stroke: '#ddd6fe' },
    },

    {
      id: 'e-be-ws',
      type: 'smoothstep',
      source: 'backend',
      sourceHandle: 'bottom-source',
      target: 'ws-gateway',
      targetHandle: 'top-target',
      style: { strokeWidth: 1.5, stroke: '#d1fae5' },
    },
    {
      id: 'e-be-auth',
      type: 'smoothstep',
      source: 'backend',
      sourceHandle: 'bottom-source',
      target: 'auth',
      targetHandle: 'top-target',
      style: { strokeWidth: 1.5, stroke: '#d1fae5' },
    },

    {
      id: 'e-graph-ws',
      type: 'default',
      source: 'graph-board',
      sourceHandle: 'right-source',
      target: 'ws-gateway',
      targetHandle: 'left-target',
      animated: true,
      style: { strokeWidth: 1.5, stroke: '#c7d2fe' },
    },

    {
      id: 'e-be-db',
      type: 'smoothstep',
      source: 'backend',
      sourceHandle: 'bottom-source',
      target: 'db',
      targetHandle: 'top-target',
      style: { strokeWidth: 1.5, stroke: '#fde68a' },
    },

    {
      id: 'e-roles-fe',
      type: 'straight',
      source: 'decision-roles',
      sourceHandle: 'bottom-source',
      target: 'frontend',
      targetHandle: 'top-target',
      style: { strokeWidth: 1.5, strokeDasharray: '6 3', stroke: '#fecdd3' },
    },
    {
      id: 'e-collab-fe',
      type: 'straight',
      source: 'decision-collab',
      sourceHandle: 'bottom-source',
      target: 'frontend',
      targetHandle: 'top-target',
      style: { strokeWidth: 1.5, strokeDasharray: '6 3', stroke: '#fecdd3' },
    },

    {
      id: 'e-xyflow-graph',
      type: 'default',
      source: 'link-xyflow',
      sourceHandle: 'top-source',
      target: 'graph-board',
      targetHandle: 'bottom-target',
      style: { strokeWidth: 1.5 },
    },
    {
      id: 'e-heroui-fe',
      type: 'default',
      source: 'link-heroui',
      sourceHandle: 'top-source',
      target: 'frontend',
      targetHandle: 'bottom-target',
      style: { strokeWidth: 1.5 },
    },

    {
      id: 'e-nodelink-ws',
      type: 'default',
      source: 'nodelink-ws',
      sourceHandle: 'left-source',
      target: 'ws-gateway',
      targetHandle: 'right-target',
      style: { strokeWidth: 1.5, strokeDasharray: '4 2' },
    },

    {
      id: 'e-ilink-be',
      type: 'default',
      source: 'ilink-graph-section',
      sourceHandle: 'left-source',
      target: 'backend',
      targetHandle: 'right-target',
      style: { strokeWidth: 1.5, strokeDasharray: '4 2' },
    },
  ],
};

async function getSection(
  project_id: string,
  section_id: string,
): Promise<any | undefined> {
  const section = await GetSection(project_id, section_id);
  if (!section) notFound();
  return section;
}

async function getBoard(board_id: string): Promise<any | undefined> {
  const board = await GetBoard(board_id);
  if (!board) notFound();
  // TODO: remove when real data saved
  if (board.type === 'graph') return Object.assign(board, GraphMockData);
  return board;
}

export default async function BoardLayout({
  params,
  children,
}: {
  params: Promise<BoardLayoutProps>;
  children: React.ReactNode;
}) {
  const { project_id, section_id, board_id } = await params;
  const sectionData = await getSection(project_id, section_id);
  const boardData = await getBoard(board_id);

  return (
    <>
      <BoardLoadingCard />
      <BoardLoader boardData={boardData} sectionData={sectionData} />
      {children}
    </>
  );
}

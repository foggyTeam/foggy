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
      id: 'n1',
      position: { x: 0, y: 0 },
      data: { title: 'Node 1' },
      type: 'externalLinkNode',
    },
    {
      id: 'n2',
      position: { x: 0, y: 100 },
      data: { title: 'Node 2' },
      type: 'customNode',
    },
  ],
  graphEdges: [
    {
      id: 'n1-n2',
      type: 'default',
      source: 'n2',
      sourceHandle: 'top-source',
      target: 'n1',
      targetHandle: 'bottom-target',
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

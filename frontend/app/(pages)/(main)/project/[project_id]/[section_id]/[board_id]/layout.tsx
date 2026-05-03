import BoardLoader from '@/app/lib/components/dataLoaders/boardLoader';
import React from 'react';
import {
  GetBoard,
  GetSection,
} from '@/app/lib/server/actions/projectServerActions';
import { notFound } from 'next/navigation';
import BoardLoadingCard from '@/app/lib/components/board/boardLoadingCard';

interface BoardLayoutProps {
  project_id: string;
  section_id: string;
  board_id: string;
}

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

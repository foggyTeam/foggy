import BoardStage from '@/app/lib/components/board/boardStage';
import BoardLoader from '@/app/lib/components/dataLoaders/boardLoader';
import { Board, RawProject } from '@/app/lib/types/definitions';
import { cookies } from 'next/headers';
import { decrypt } from '@/app/lib/session';
import { signOut } from '@/auth';
import board from '@/app/mockData/board.json';
import { BoardProvider } from '@/app/lib/components/board/boardContext';
import Cursors from '@/app/lib/components/board/cursors';
import ProjectLoader from '@/app/lib/components/dataLoaders/projectLoader';
import React from 'react';
import project from '@/app/mockData/project.json';

interface BoardPageProps {
  project_id: string;
  section_id: string;
  board_id: string;
}

async function getProject(id: string): Promise<RawProject | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(project as RawProject), 300);
  });
}

async function getBoard(
  project_id: string,
  section_id: string,
  board_id: string,
): Promise<Board | undefined> {
  const cookie = (await cookies()).get('session' as any)?.value;
  const session = await decrypt(cookie);

  if (!session) {
    return undefined;
  }

  try {
    return new Promise((resolve) => {
      setTimeout(() => resolve(board as Board), 300);
    });
  } catch (e) {
    console.error('User with this id does not exist.');
    await signOut();
    return undefined;
  }
}

export default async function BoardPage({
  params,
}: {
  params: Promise<BoardPageProps>;
}) {
  const { project_id, section_id, board_id } = await params;
  const projectData = await getProject(project_id);
  const boardData = await getBoard(project_id, section_id, board_id);

  return (
    <>
      <BoardProvider>
        <BoardStage />
        <Cursors />
      </BoardProvider>
      <ProjectLoader projectData={projectData} />
      <BoardLoader boardData={boardData} />
    </>
  );
}

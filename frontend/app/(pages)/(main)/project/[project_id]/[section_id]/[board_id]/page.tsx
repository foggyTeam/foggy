import BoardStage from '@/app/lib/components/board/boardStage';
import BoardLoader from '@/app/lib/components/dataLoaders/boardLoader';
import { Board, ProjectSection } from '@/app/lib/types/definitions';
import { signOut } from '@/auth';
import { BoardProvider } from '@/app/lib/components/board/boardContext';
import Cursors from '@/app/lib/components/board/cursors';
import React from 'react';
import { getRequest } from '@/app/lib/server/requests';
import getUserId from '@/app/lib/getUserId';

interface BoardPageProps {
  project_id: string;
  section_id: string;
  board_id: string;
}

async function getSection(
  project_id: string,
  section_id: string,
): Promise<ProjectSection | undefined> {
  try {
    return await getRequest(`projects/${project_id}/sections/${section_id}`, {
      headers: {
        'x-user-id': await getUserId(),
      },
    });
  } catch (e) {
    console.error('Project with this id does not exist.', e);
    await signOut();
    return undefined;
  }
}

async function getBoard(board_id: string): Promise<Board | undefined> {
  try {
    // TODO: add
    return await getRequest(`projects/${board_id}`, {
      headers: {
        'x-user-id': await getUserId(),
      },
    });
  } catch (e) {
    console.error('Board with this id does not exist.', e);
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
  // TODO: load section data
  const sectionData = await getSection(project_id, section_id);
  const boardData = await getBoard(board_id);

  return (
    <>
      <BoardProvider>
        <BoardStage />
        <Cursors />
      </BoardProvider>
      <BoardLoader boardData={boardData} />
    </>
  );
}

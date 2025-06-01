import BoardStage from '@/app/lib/components/board/boardStage';
import BoardLoader from '@/app/lib/components/dataLoaders/boardLoader';
import { BoardProvider } from '@/app/lib/components/board/boardContext';
import Cursors from '@/app/lib/components/board/cursors';
import React from 'react';
import {
  GetBoard,
  GetSection,
} from '@/app/lib/server/actions/projectServerActions';

interface BoardPageProps {
  project_id: string;
  section_id: string;
  board_id: string;
}

async function getSection(
  project_id: string,
  section_id: string,
): Promise<any | undefined> {
  try {
    return await GetSection(project_id, section_id);
  } catch (e) {
    console.error('Section with this id does not exist.', e);
    return undefined;
  }
}

async function getBoard(board_id: string): Promise<any | undefined> {
  try {
    return await GetBoard(board_id);
  } catch (e) {
    console.error('Board with this id does not exist.', e);
    return undefined;
  }
}

export default async function BoardPage({
  params,
}: {
  params: Promise<BoardPageProps>;
}) {
  const { project_id, section_id, board_id } = await params;
  const sectionData = await getSection(project_id, section_id);
  const boardData = await getBoard(board_id);

  return (
    <>
      <BoardProvider>
        <BoardStage />
        <Cursors />
      </BoardProvider>
      <BoardLoader boardData={boardData} sectionData={sectionData} />
    </>
  );
}

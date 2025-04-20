import RecentBar from '@/app/lib/components/menu/projectBar/recentBar';
import BoardStage from '@/app/lib/components/board/boardStage';
import Cursors from '@/app/lib/components/board/cursors';
import BoardLoader from '@/app/lib/components/dataLoaders/boardLoader';
import { Board } from '@/app/lib/types/definitions';
import { cookies } from 'next/headers';
import { decrypt } from '@/app/lib/session';
import { signOut } from '@/auth';
import board from '@/app/mockData/board.json';

interface BoardPageProps {
  project_id: string;
  section_id: string;
  board_id: string;
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

export default async function BoardPage(params: BoardPageProps) {
  const { project_id, section_id, board_id } = await params;
  const boardData = await getBoard(project_id, section_id, board_id);

  return (
    <>
      <Cursors />
      <BoardLoader boardData={boardData} />
      <RecentBar />
      <BoardStage />
    </>
  );
}

import RecentBar from '@/app/lib/components/menu/projectBar/recentBar';
import BoardStage from '@/app/lib/components/board/boardStage';
import Cursors from '@/app/lib/components/board/cursors';

export default function Board() {
  return (
    <>
      <Cursors />
      <RecentBar />
      <BoardStage />
    </>
  );
}

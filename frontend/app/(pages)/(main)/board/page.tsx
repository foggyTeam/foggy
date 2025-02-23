import RecentBar from '@/app/lib/components/menu/projectBar/recentBar';
import ToolBar from '@/app/lib/components/menu/projectBar/toolBar';
import BoardStage from '@/app/lib/components/board/boardStage';
import Cursors from '@/app/lib/components/board/cursors';

export default function Board() {
  return (
    <>
      <Cursors />
      <RecentBar />
      <BoardStage />
      <div className="flex justify-center">
        <ToolBar />
      </div>
    </>
  );
}

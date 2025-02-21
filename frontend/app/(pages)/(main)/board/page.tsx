import RecentBar from '@/app/lib/components/menu/projectBar/recentBar';
import ToolBar from '@/app/lib/components/menu/projectBar/toolBar';
import BoardStage from '@/app/lib/components/board/boardStage';

export default function Board() {
  return (
    <>
      <RecentBar />
      <BoardStage />
      <div className="flex justify-center">
        <ToolBar />
      </div>
    </>
  );
}

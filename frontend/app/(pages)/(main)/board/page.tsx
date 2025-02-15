import RecentBar from '@/app/lib/components/menu/projectBar/recentBar';
import ToolBar from '@/app/lib/components/menu/projectBar/toolBar';
import Cursors from '@/app/lib/components/board/cursors';

export default function Board() {
  return (
    <>
      <Cursors />
      <RecentBar />
      <div className="flex justify-center">
        <ToolBar />
      </div>
    </>
  );
}

import RecentBar from '@/app/lib/components/menu/projectBar/recentBar';
import ToolBar from '@/app/lib/components/menu/projectBar/toolBar';

export default function Board() {
  return (
    <>
      <RecentBar />
      <div className="flex justify-center">
        <ToolBar />
      </div>
    </>
  );
}

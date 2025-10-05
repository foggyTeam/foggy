import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
import BoardLoadingCard from '@/app/lib/components/boardLoadingCard';

export default function BoardLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className={clsx(
          'flex h-fit w-full max-w-sm flex-col items-center justify-center gap-4',
          bg_container,
          'px-12',
        )}
      >
        <BoardLoadingCard />
      </div>
    </div>
  );
}

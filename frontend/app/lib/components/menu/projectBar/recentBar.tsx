'use client';
import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
import { observer } from 'mobx-react-lite';
import { Button } from '@heroui/button';
import { PlusIcon } from 'lucide-react';
import projectsStore from '@/app/stores/projectsStore';
import BoardIcon from '@/app/lib/components/menu/projectBar/boardIcon';

const RecentBar = observer(() => {
  return (
    <div
      className={clsx(
        'absolute left-0 top-1/3 z-50 flex w-fit flex-col items-center' +
          ' justify-center gap-1 rounded-l-none rounded-r-[64px] px-3 py-6',
        bg_container,
      )}
    >
      {projectsStore.activeProject
        ? projectsStore.activeProject.boards?.slice(-4).map((board) => (
            <Button
              onPress={() => console.log(board.name)}
              key={board.id}
              isIconOnly
              variant="light"
              size="md"
            >
              <BoardIcon boardType={board.type} />
            </Button>
          ))
        : null}
      <Button
        onPress={() => {
          // TODO: REDO
          console.log('you click me');
        }}
        isIconOnly
        variant="light"
        size="md"
      >
        <PlusIcon className="stroke-default-500" />
      </Button>
    </div>
  );
});

export default RecentBar;

'use client';
import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
import { observer } from 'mobx-react-lite';
import { Button } from '@heroui/button';
import { PlusIcon } from 'lucide-react';
import projectsStore from '@/app/stores/projectsStore';
import { Board, Project } from '@/app/lib/types/definitions';
import BoardIcon from '@/app/lib/components/menu/projectBar/boardIcon';
import userStore from '@/app/stores/userStore';

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
          projectsStore.addProject(
            new Project({
              id: 'lufglglyg1',
              name: 'First project',
              creator: {
                id: userStore.user?.id || 'hi',
                nickname: userStore.user?.name || 'hi',
                avatar: userStore.user?.image || undefined,
              },
            }),
          );
          projectsStore.setActiveProject('lufglglyg1');

          for (let i = 0; i < 5; i++) {
            projectsStore.addBoard({
              projectId: 'lufglglyg1',
              section: 'test section',
              id: `jhgluygs${i}`,
              name: `file ${i}`,
              type: 'SIMPLE',
              layers: [[], [], []],
              lastChange: new Date().toISOString(),
            } as Board);
            projectsStore.addBoard({
              projectId: 'lufglglyg1',
              section: 'test section',
              id: `jhgluygg${i}`,
              name: `file ${i}`,
              type: 'GRAPH',
              layers: [[], [], []],
              lastChange: new Date().toISOString(),
            } as Board);
            projectsStore.addBoard({
              projectId: 'lufglglyg1',
              section: 'test section',
              id: `jhgluygt${i}`,
              name: `file ${i}`,
              type: 'TREE',
              layers: [[], [], []],
              lastChange: new Date().toISOString(),
            } as Board);
          }
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

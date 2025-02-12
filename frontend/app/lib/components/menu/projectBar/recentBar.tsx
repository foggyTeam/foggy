'use client';
import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/style_definitions';
import { observer } from 'mobx-react-lite';
import { Button } from '@heroui/button';
import { PlusIcon } from 'lucide-react';
import projectsStore from '@/app/stores/projectsStore';
import { Board, BoardTypes, Project } from '@/app/lib/types/definitions';
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
        ? projectsStore.activeProject.boards.slice(-4).map((board) => (
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
          projectsStore.addProject({
            id: 'lufglglyg1',
            name: 'First project',
            boards: [],
            lastChange: Date.now().toString(),
          } as Project);
          projectsStore.setActiveProject('lufglglyg1');

          for (let i = 0; i < 5; i++) {
            projectsStore.addBoard({
              projectId: 'lufglglyg1',
              section: 'test section',
              id: `jhgluygs${i}`,
              name: `file ${i}`,
              type: BoardTypes.SIMPLE,
              lastChange: Date.now().toString(),
            } as Board);
            projectsStore.addBoard({
              projectId: 'lufglglyg1',
              section: 'test section',
              id: `jhgluygg${i}`,
              name: `file ${i}`,
              type: BoardTypes.GRAPH,
              lastChange: Date.now().toString(),
            } as Board);
            projectsStore.addBoard({
              projectId: 'lufglglyg1',
              section: 'test section',
              id: `jhgluygt${i}`,
              name: `file ${i}`,
              type: BoardTypes.TREE,
              lastChange: Date.now().toString(),
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

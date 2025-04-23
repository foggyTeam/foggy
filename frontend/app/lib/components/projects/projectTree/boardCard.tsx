import { Board } from '@/app/lib/types/definitions';
import { useState } from 'react';
import projectsStore from '@/app/stores/projectsStore';
import { Input } from '@heroui/input';
import BoardIcon from '@/app/lib/components/menu/projectBar/boardIcon';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useActiveSectionContext } from '@/app/lib/components/projects/projectTree/projectTree';

export default function BoardCard({
  parentList,
  board,
}: {
  parentList: string[];
  board: Pick<Board, 'id' | 'sectionId' | 'name' | 'type' | 'lastChange'>;
}) {
  const { activeNode, setActiveNode } = useActiveSectionContext();
  const router = useRouter();
  const [isReadonly, setIsReadonly] = useState(true);
  const [boardName, setBoardName] = useState(board.name);

  const updateBoardName = () => {
    setIsReadonly(true);
    projectsStore.updateProjectChild(parentList, board.id, {
      name: boardName,
      lastChange: new Date().toISOString(),
    });
  };

  return (
    <div
      onDoubleClick={() =>
        router.push(
          `${projectsStore.activeProject?.id}/${board.sectionId}/${board.id}`,
        )
      }
      style={{ paddingLeft: `${parentList.length * 16}px` }}
      className="flex max-h-16 w-full items-center justify-between gap-2"
    >
      <div
        onClick={() => setActiveNode({ id: board.id, parentList })}
        className={clsx(
          'flex w-full cursor-pointer items-center justify-start gap-0 rounded-xl p-1 transition-colors hover:bg-default-100',
          activeNode &&
            board.id === activeNode.id &&
            'bg-primary-100 hover:bg-primary-100',
        )}
      >
        <div className="flex h-8 w-8 items-center justify-center">
          <BoardIcon boardType={board.type} />
        </div>
        <Input
          isReadOnly={isReadonly}
          autoFocus={!isReadonly}
          onClick={(e) => e.stopPropagation()}
          onFocus={() => setIsReadonly(false)}
          onBlur={updateBoardName}
          value={boardName}
          onValueChange={setBoardName}
          variant="bordered"
          size="sm"
          className={clsx(
            'h-6 w-fit content-center rounded-md border-1.5 border-default/0',
            !isReadonly && 'border-default-200',
          )}
          classNames={{
            main: 'h-6',
            mainWrapper: 'flex justify-center',
            inputWrapper: 'shadow-none max-w-sm transition-all border-none',
            input: 'truncate text-nowrap',
          }}
        />
      </div>
    </div>
  );
}

import { Board } from '@/app/lib/types/definitions';
import { useState } from 'react';
import projectsStore from '@/app/stores/projectsStore';
import { Input } from '@heroui/input';
import BoardIcon from '@/app/lib/components/menu/projectBar/boardIcon';

export default function BoardCard({
  parentList,
  board,
}: {
  parentList: string[];
  board: Pick<Board, 'id' | 'name' | 'type' | 'lastChange'>;
}) {
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
      style={{ paddingLeft: `${parentList.length * 16}px` }}
      className={'flex max-h-16 w-full items-start justify-center p-1'}
    >
      <div
        onDoubleClick={() => setIsReadonly(false)}
        className="flex w-full items-center justify-start gap-0"
      >
        <div className="flex h-8 w-8 items-center justify-center">
          <BoardIcon boardType={board.type} />
        </div>
        <Input
          isReadOnly={isReadonly}
          value={boardName}
          onValueChange={setBoardName}
          onBlur={updateBoardName}
          variant="bordered"
          size="sm"
          classNames={{
            inputWrapper: 'border-none shadow-none max-w-sm',
            input: 'truncate text-nowrap',
          }}
        />
      </div>
    </div>
  );
}

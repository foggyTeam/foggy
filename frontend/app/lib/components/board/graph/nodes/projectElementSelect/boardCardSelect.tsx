import { Board } from '@/app/lib/types/definitions';
import ElementIcon from '@/app/lib/components/menu/leftSideBar/elementIcon';
import clsx from 'clsx';
import { useSelectElementContext } from '@/app/lib/components/board/graph/nodes/projectElementSelect/projectTreeSelect';
import { useCallback, useMemo } from 'react';

export default function BoardCardSelect({
  parentList,
  board,
}: {
  parentList: string[];
  board: Pick<Board, 'id' | 'sectionId' | 'name' | 'type' | 'lastChange'>;
}) {
  const { selectedId, onSelect } = useSelectElementContext();

  const isSelected = useMemo(() => board.id === selectedId, [selectedId]);

  const handleSelect = useCallback(() => {
    onSelect(
      isSelected
        ? undefined
        : {
            type: board.type,
            title: board.name,
            path: [...parentList, board.id],
          },
    );
  }, [onSelect, parentList, isSelected]);

  return (
    <div
      data-testid="board-card"
      className="flex max-h-16 w-full items-center justify-between gap-2 py-0.5 pr-0 pl-5 sm:p-1 sm:pl-10"
    >
      <div
        onClick={handleSelect}
        className={clsx(
          'hover:bg-default-100 group flex w-full cursor-pointer items-center justify-start gap-0 rounded-xl p-0.5 pr-0 transition-colors sm:p-1',
          isSelected && 'bg-primary-100 hover:bg-primary-100',
        )}
      >
        <div className="flex h-full w-full items-center">
          <div className="flex h-10 w-10 items-center justify-center sm:h-8 sm:w-8">
            <ElementIcon elementType={board.type} />
          </div>
          <p className="h-6 truncate px-2 text-nowrap">{board.name}</p>
        </div>
      </div>
    </div>
  );
}

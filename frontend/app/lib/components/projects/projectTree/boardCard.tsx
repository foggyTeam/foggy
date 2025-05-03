import { Board } from '@/app/lib/types/definitions';
import { useState } from 'react';
import projectsStore from '@/app/stores/projectsStore';
import ElementIcon from '@/app/lib/components/menu/projectBar/elementIcon';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useActiveSectionContext } from '@/app/lib/components/projects/projectTree/projectTree';
import { Button } from '@heroui/button';
import { TrashIcon } from 'lucide-react';
import NameInput from '@/app/lib/components/projects/projectTree/nameInput';
import CheckAccess from '@/app/lib/utils/checkAccess';

export default function BoardCard({
  parentList,
  board,
}: {
  parentList: string[];
  board: Pick<Board, 'id' | 'sectionId' | 'name' | 'type' | 'lastChange'>;
}) {
  const { activeNodes, setActiveNodes, removeNode } = useActiveSectionContext();
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
      className="flex max-h-16 w-full items-center justify-between gap-2 p-1 pl-10 pr-0"
    >
      <div
        onClick={(event) =>
          setActiveNodes(
            event.ctrlKey
              ? [...activeNodes, { id: board.id, parentList }]
              : [{ id: board.id, parentList }],
          )
        }
        className={clsx(
          'group flex w-full cursor-pointer items-center justify-start gap-0 rounded-xl p-1 pr-0 transition-colors hover:bg-default-100',
          activeNodes.length &&
            activeNodes.findIndex((node) => node.id == board.id) > -1 &&
            'bg-primary-100 hover:bg-primary-100',
        )}
      >
        <div className="flex h-full w-full items-center">
          <div className="flex h-8 w-8 items-center justify-center">
            <ElementIcon elementType={board.type} />
          </div>
          <NameInput
            isReadonly={
              isReadonly || !CheckAccess(['admin', 'owner', 'editor'])
            }
            setIsReadonly={setIsReadonly}
            onBlur={updateBoardName}
            value={boardName}
            onValueChange={setBoardName}
          />
        </div>
        <div className="invisible flex h-full w-fit items-center justify-end gap-2 pr-2 group-hover:visible">
          {CheckAccess(['admin', 'owner', 'editor']) && (
            <Button
              isIconOnly
              onPress={() => removeNode(board.id, parentList)}
              variant="light"
              color="danger"
              size="sm"
            >
              <TrashIcon className="stroke-danger-500" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

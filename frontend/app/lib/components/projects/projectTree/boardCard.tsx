import { SimpleBoard } from '@/app/lib/types/definitions';
import { useState } from 'react';
import projectsStore from '@/app/stores/projectsStore';
import ElementIcon from '@/app/lib/components/menu/leftSideBar/elementIcon';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useActiveSectionContext } from '@/app/lib/components/projects/projectTree/projectTree';
import { Button } from '@heroui/button';
import { TrashIcon } from 'lucide-react';
import NameInput from '@/app/lib/components/projects/projectTree/nameInput';
import CheckAccess from '@/app/lib/utils/checkAccess';
import { UpdateBoard } from '@/app/lib/server/actions/projectServerActions';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import { useTopLoader } from 'nextjs-toploader';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

export default function BoardCard({
  parentList,
  board,
}: {
  parentList: string[];
  board: Pick<SimpleBoard, 'id' | 'sectionId' | 'name' | 'type' | 'lastChange'>;
}) {
  const { isMobile, smallerSize } = useAdaptiveParams();
  const { activeNodes, setActiveNodes, removeNode } = useActiveSectionContext();
  const router = useRouter();
  const { start } = useTopLoader();
  const [isReadonly, setIsReadonly] = useState(true);
  const [boardName, setBoardName] = useState(board.name);

  const updateBoardName = async (newName: string) => {
    setIsReadonly(true);
    if (!projectsStore.activeProject) return;

    await UpdateBoard(board.id, {
      name: newName,
    })
      .catch(() =>
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.board.updateBoardError,
        }),
      )
      .then(() =>
        projectsStore.updateProjectChild(parentList, board.id, {
          name: newName,
          lastChange: new Date().toISOString(),
        }),
      );
  };

  function handleClick(event: any) {
    if (isMobile) {
      handleDoubleClick();
      return;
    }
    setActiveNodes(
      event.ctrlKey
        ? [...activeNodes, { id: board.id, parentList }]
        : [{ id: board.id, parentList }],
    );
  }

  function handleDoubleClick() {
    start();
    settingsStore.startLoading();
    router.push(
      `${projectsStore.activeProject?.id}/${board.sectionId}/${board.id}/${board.type.toLowerCase()}`,
    );
  }

  return (
    <div
      data-testid="board-card"
      onDoubleClick={handleDoubleClick}
      className="flex max-h-16 w-full items-center justify-between gap-2 py-0.5 pr-0 pl-5 sm:p-1 sm:pl-10"
    >
      <div
        onClick={(event) => handleClick(event)}
        className={clsx(
          'hover:bg-default-100 group flex w-full cursor-pointer items-center justify-start gap-0 rounded-xl p-0.5 pr-0 transition-colors sm:p-1',
          activeNodes.length &&
            activeNodes.findIndex((node) => node.id == board.id) > -1 &&
            'bg-primary-100 hover:bg-primary-100',
        )}
      >
        <div className="flex h-full w-full items-center">
          <div className="flex h-10 w-10 items-center justify-center sm:h-8 sm:w-8">
            <ElementIcon elementType={board.type} />
          </div>
          <NameInput
            isReadonly={
              isReadonly ||
              !CheckAccess(['admin', 'owner', 'editor'], 'project')
            }
            setIsReadonly={setIsReadonly}
            onBlur={updateBoardName}
            value={boardName}
            onValueChange={setBoardName}
          />
        </div>
        <div className="flex h-full w-fit items-center justify-end gap-0.5 pr-1 group-hover:visible sm:invisible sm:gap-2 sm:pr-2">
          {CheckAccess(['admin', 'owner', 'editor'], 'project') && (
            <Button
              data-testid="delete-btn"
              isIconOnly
              onPress={() => removeNode(board.id, parentList)}
              variant="light"
              color="danger"
              size={smallerSize}
            >
              <TrashIcon className="stroke-danger-500" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

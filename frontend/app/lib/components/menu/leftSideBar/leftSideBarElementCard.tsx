import { Board, ProjectSection } from '@/app/lib/types/definitions';
import { Button } from '@heroui/button';
import { PlusIcon, TrashIcon } from 'lucide-react';
import CheckAccess from '@/app/lib/utils/checkAccess';
import ElementIcon from '@/app/lib/components/menu/leftSideBar/elementIcon';

export default function LeftSideBarElementCard({
  element,
  isActive,
  handleClick,
  addNode,
  removeNode,
}: {
  element: ProjectSection | Board;
  isActive?: boolean;
  handleClick: () => void;
  addNode: () => void;
  removeNode: () => void;
}) {
  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
        handleClick();
      }}
      className="group flex max-h-16 w-full cursor-pointer items-center justify-between gap-2 rounded-xl p-1 transition-colors hover:bg-default-100"
    >
      <div className="flex h-full w-full items-center gap-3 text-sm">
        <ElementIcon
          elementType={'type' in element ? element.type : 'SECTION'}
        />
        <p className={isActive ? 'font-medium text-f_accent' : ''}>
          {element.name}
        </p>
      </div>
      <div className="invisible flex h-full w-fit items-center justify-end gap-2 pr-2 group-hover:visible">
        {CheckAccess(['admin', 'owner', 'editor']) && (
          <>
            {'children' in element && (
              <Button isIconOnly onPress={addNode} variant="light" size="sm">
                <PlusIcon className="stroke-default-500" />
              </Button>
            )}
            <Button
              isIconOnly
              onPress={removeNode}
              variant="light"
              color="danger"
              size="sm"
            >
              <TrashIcon className="stroke-danger-500" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

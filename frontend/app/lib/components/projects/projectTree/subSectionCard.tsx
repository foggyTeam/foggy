import { ProjectSection } from '@/app/lib/types/definitions';
import { useState } from 'react';
import projectsStore from '@/app/stores/projectsStore';
import clsx from 'clsx';
import { Button } from '@heroui/button';
import { ChevronRightIcon, PlusIcon, TrashIcon } from 'lucide-react';
import BoardCard from '@/app/lib/components/projects/projectTree/boardCard';
import { useActiveSectionContext } from '@/app/lib/components/projects/projectTree/projectTree';
import NameInput from '@/app/lib/components/projects/projectTree/nameInput';

export default function SubSectionCard({
  parentList,
  subSection,
}: {
  parentList: string[];
  subSection: ProjectSection;
}) {
  const { activeNodes, setActiveNodes, addNode, removeNode } =
    useActiveSectionContext();
  const [isReadonly, setIsReadonly] = useState(true);
  const [subSectionName, setSubSectionName] = useState(subSection.name);
  const [isExpanded, setIsExpanded] = useState(false);

  const updateSectionName = () => {
    setIsReadonly(true);
    projectsStore.updateProjectChild(parentList, subSection.id, {
      name: subSectionName,
      lastChange: new Date().toISOString(),
    });
  };

  return (
    <div
      style={{ paddingLeft: `${parentList.length * 16}px` }}
      className={clsx(
        'flex max-h-16 w-full flex-col items-start justify-start p-1 pr-0 transition-all duration-500',
        isExpanded && 'max-h-[1000px]',
      )}
    >
      <div
        onClick={(event) =>
          setActiveNodes(
            event.ctrlKey
              ? [...activeNodes, { id: subSection.id, parentList }]
              : [{ id: subSection.id, parentList }],
          )
        }
        className={clsx(
          'group flex w-full cursor-pointer items-center justify-start gap-0 rounded-xl p-1 pr-0 hover:bg-default-100',
          activeNodes.length &&
            activeNodes.findIndex((node) => node.id == subSection.id) > -1 &&
            'bg-primary-100 hover:bg-primary-100',
        )}
      >
        <div className="flex h-full w-full items-center">
          <Button
            isIconOnly
            onPress={() => setIsExpanded(!isExpanded)}
            variant="light"
            size="sm"
          >
            <ChevronRightIcon
              className={clsx(
                'stroke-default-500 transition-transform',
                isExpanded && 'rotate-90',
              )}
            />
          </Button>
          <NameInput
            isReadonly={isReadonly}
            setIsReadonly={setIsReadonly}
            onBlur={updateSectionName}
            value={subSectionName}
            onValueChange={setSubSectionName}
          />
        </div>
        <div className="invisible flex h-full w-fit items-center justify-end gap-2 pr-2 group-hover:visible">
          <Button
            isIconOnly
            onPress={() => addNode([...parentList, subSection.id])}
            variant="light"
            size="sm"
          >
            <PlusIcon className="stroke-default-500" />
          </Button>
          <Button
            isIconOnly
            onPress={() => removeNode(subSection.id, parentList)}
            variant="light"
            color="danger"
            size="sm"
          >
            <TrashIcon className="stroke-danger-500" />
          </Button>
        </div>
      </div>
      {isExpanded &&
        Array.from(subSection.children.values()).map((child) => {
          return 'type' in child ? (
            <BoardCard
              key={child.id}
              parentList={[...parentList, subSection.id]}
              board={child}
            />
          ) : (
            <SubSectionCard
              key={child.id}
              parentList={[...parentList, subSection.id]}
              subSection={child}
            />
          );
        })}
    </div>
  );
}

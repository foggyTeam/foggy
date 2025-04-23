import { ProjectSection } from '@/app/lib/types/definitions';
import { useState } from 'react';
import projectsStore from '@/app/stores/projectsStore';
import clsx from 'clsx';
import { Button } from '@heroui/button';
import { ChevronRightIcon } from 'lucide-react';
import { Input } from '@heroui/input';
import BoardCard from '@/app/lib/components/projects/projectTree/boardCard';
import { useActiveSectionContext } from '@/app/lib/components/projects/projectTree/projectTree';

export default function SubSectionCard({
  parentList,
  subSection,
}: {
  parentList: string[];
  subSection: ProjectSection;
}) {
  const { activeNode, setActiveNode } = useActiveSectionContext();
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
        'flex max-h-16 w-full flex-col items-start justify-start p-1 transition-all duration-500',
        isExpanded && 'max-h-[1000px]',
      )}
    >
      <div
        onClick={() => setActiveNode({ id: subSection.id, parentList })}
        className={clsx(
          'flex w-full cursor-pointer items-center justify-start gap-0 rounded-xl p-1 hover:bg-default-100',
          activeNode &&
            subSection.id === activeNode.id &&
            'bg-primary-100 hover:bg-primary-100',
        )}
      >
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
        <Input
          isReadOnly={isReadonly}
          autoFocus={!isReadonly}
          onClick={(e) => e.stopPropagation()}
          onFocus={() => setIsReadonly(false)}
          onBlur={updateSectionName}
          value={subSectionName}
          onValueChange={setSubSectionName}
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

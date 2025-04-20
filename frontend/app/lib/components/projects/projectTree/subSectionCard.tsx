import { ProjectSection } from '@/app/lib/types/definitions';
import { useState } from 'react';
import projectsStore from '@/app/stores/projectsStore';
import clsx from 'clsx';
import { Button } from '@heroui/button';
import { ChevronRightIcon } from 'lucide-react';
import { Input } from '@heroui/input';
import BoardCard from '@/app/lib/components/projects/projectTree/boardCard';

export default function SubSectionCard({
  parentList,
  subSection,
}: {
  parentList: string[];
  subSection: ProjectSection;
}) {
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
        onDoubleClick={() => setIsReadonly(false)}
        className="flex w-full items-center justify-start gap-0"
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
          value={subSectionName}
          onValueChange={setSubSectionName}
          onBlur={updateSectionName}
          variant="bordered"
          size="sm"
          classNames={{
            inputWrapper: 'border-none shadow-none max-w-sm',
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

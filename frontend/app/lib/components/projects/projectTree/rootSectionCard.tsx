import { ProjectSection } from '@/app/lib/types/definitions';
import clsx from 'clsx';
import { el_animation } from '@/app/lib/types/styles';
import { useState } from 'react';
import { Input } from '@heroui/input';
import projectsStore from '@/app/stores/projectsStore';
import { Button } from '@heroui/button';
import { ChevronRightIcon } from 'lucide-react';
import SubSectionCard from '@/app/lib/components/projects/projectTree/subSectionCard';
import BoardCard from '@/app/lib/components/projects/projectTree/boardCard';

export default function RootSectionCard({
  section,
}: {
  section: ProjectSection;
}) {
  const [isReadonly, setIsReadonly] = useState(true);
  const [sectionName, setSectionName] = useState(section.name);
  const [isExpanded, setIsExpanded] = useState(false);

  const updateSectionName = () => {
    setIsReadonly(true);
    projectsStore.updateProjectChild([], section.id, {
      name: sectionName,
      lastChange: new Date().toISOString(),
    });
  };

  return (
    <div
      className={clsx(
        'box-border flex flex-col items-start justify-start rounded-2xl',
        'w-full bg-white px-3 py-2 shadow-container hover:bg-default-50',
        'max-h-16 transition-all duration-500',
        !isExpanded && el_animation,
        isExpanded && 'max-h-[1000px]',
      )}
    >
      <div
        onDoubleClick={() => setIsReadonly(false)}
        className="flex h-12 w-full items-center justify-start gap-0"
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
          value={sectionName.toUpperCase()}
          onValueChange={setSectionName}
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
        Array.from(section.children.values()).map((child) => {
          return 'type' in child ? (
            <BoardCard key={child.id} parentList={[section.id]} board={child} />
          ) : (
            <SubSectionCard
              key={child.id}
              parentList={[section.id]}
              subSection={child}
            />
          );
        })}
    </div>
  );
}

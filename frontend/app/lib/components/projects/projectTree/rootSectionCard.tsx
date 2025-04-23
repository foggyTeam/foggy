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
import { useActiveSectionContext } from '@/app/lib/components/projects/projectTree/projectTree';

export default function RootSectionCard({
  section,
}: {
  section: ProjectSection;
}) {
  const { activeNode, setActiveNode } = useActiveSectionContext();
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
      tabIndex={0}
      onBlur={() => setActiveNode(null)}
      className={clsx(
        'box-border flex flex-col items-start justify-start rounded-2xl',
        'w-full bg-white px-3 py-2 shadow-container hover:bg-default-50',
        'max-h-16 transition-all duration-500',
        !isExpanded && el_animation,
        isExpanded && 'max-h-[1000px]',
      )}
    >
      <div
        onClick={() => setActiveNode({ id: section.id, parentList: [] })}
        className={clsx(
          'flex h-12 w-full cursor-pointer items-center justify-start gap-0 rounded-xl hover:bg-default-100',
          activeNode &&
            section.id === activeNode.id &&
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
          value={sectionName.toUpperCase()}
          onValueChange={setSectionName}
          isReadOnly={isReadonly}
          autoFocus={!isReadonly}
          onClick={(e) => e.stopPropagation()}
          onFocus={() => setIsReadonly(false)}
          onBlur={updateSectionName}
          variant="bordered"
          className={clsx(
            'h-6 w-full max-w-56 content-center rounded-md border-1.5 border-default/0',
            !isReadonly && 'border-default-200',
          )}
          classNames={{
            main: 'h-6',
            mainWrapper: 'flex justify-center',
            inputWrapper: 'shadow-none max-w-lg transition-all border-none',
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

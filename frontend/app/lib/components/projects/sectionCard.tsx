import { ProjectSection } from '@/app/lib/types/definitions';
import clsx from 'clsx';
import { el_animation } from '@/app/lib/types/styles';
import { useState } from 'react';
import { Input } from '@heroui/input';
import projectsStore from '@/app/stores/projectsStore';
import { Button } from '@heroui/button';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';

export default function SectionCard({ section }: { section: ProjectSection }) {
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
      onDoubleClick={() => setIsReadonly(false)}
      className={clsx(
        'box-border flex items-center justify-between gap-1 rounded-2xl',
        'h-fit min-h-16 w-full bg-white px-3 py-2 shadow-container hover:bg-default-50',
        el_animation,
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
        value={sectionName.toUpperCase()}
        onValueChange={setSectionName}
        onBlur={updateSectionName}
        variant="bordered"
        className="w-fit"
        classNames={{
          inputWrapper: 'border-none shadow-none',
        }}
      />
    </div>
  );
}

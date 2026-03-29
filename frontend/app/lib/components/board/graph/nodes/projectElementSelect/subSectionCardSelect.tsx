import { ProjectSection } from '@/app/lib/types/definitions';
import { useCallback, useMemo, useState } from 'react';
import projectsStore from '@/app/stores/projectsStore';
import clsx from 'clsx';
import { Button } from '@heroui/button';
import { ChevronRightIcon } from 'lucide-react';
import { Spinner } from '@heroui/spinner';
import { observer } from 'mobx-react-lite';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import BoardCardSelect from '@/app/lib/components/board/graph/nodes/projectElementSelect/boardCardSelect';
import { useSelectElementContext } from '@/app/lib/components/board/graph/nodes/projectElementSelect/projectTreeSelect';

const SubSectionCardSelect = observer(
  ({ parentList, id }: { parentList: string[]; id: string }) => {
    const { smallerSize } = useAdaptiveParams();
    const subSection = projectsStore.getProjectChild(
      id,
      parentList,
    ) as ProjectSection;
    const { path, selectedId, loadSection, onSelect } =
      useSelectElementContext();

    const [isExpanded, setIsExpanded] = useState(path.has(id));
    const isSelected = useMemo(() => id === selectedId, [selectedId]);

    const handleSelect = useCallback(() => {
      onSelect(
        isSelected
          ? undefined
          : {
              type: 'SECTION',
              title: subSection.name,
              path: [...parentList, id],
            },
      );
    }, [onSelect, parentList, isSelected]);

    return (
      <div
        aria-expanded={isExpanded}
        data-testid="section-card"
        className={clsx(
          'flex max-h-16 w-full flex-col items-start justify-start py-0.5 pr-0 transition-all duration-500 sm:py-1',
          parentList.length && 'pl-5 sm:pl-10',
          isExpanded && 'max-h-[1000px]',
        )}
      >
        <div
          onClick={handleSelect}
          className={clsx(
            'hover:bg-default-100 group flex w-full cursor-pointer items-center justify-start gap-0 rounded-xl p-0.5 pr-0 sm:p-1',
            isSelected && 'bg-primary-100 hover:bg-primary-100',
          )}
        >
          <div className="flex h-full w-full items-center">
            <Button
              data-testid="expand-btn"
              isIconOnly
              onPress={() => {
                if (subSection.childrenNumber !== subSection.children.size)
                  loadSection(subSection.id, parentList);
                setIsExpanded(!isExpanded);
              }}
              variant="light"
              size={smallerSize}
            >
              <ChevronRightIcon
                className={clsx(
                  'stroke-default-600 transition-transform',
                  isExpanded && 'rotate-90',
                )}
              />
            </Button>
            <p className="h-6 truncate px-2 text-nowrap">{subSection.name}</p>
          </div>
        </div>
        {isExpanded &&
          (subSection.childrenNumber !== subSection.children.size ? (
            <Spinner className="w-full p-1" size={smallerSize} />
          ) : (
            Array.from(subSection.children.values()).map((child) => {
              return 'type' in child ? (
                <BoardCardSelect
                  key={child.id}
                  parentList={[...parentList, subSection.id]}
                  board={child}
                />
              ) : (
                <SubSectionCardSelect
                  key={child.id}
                  parentList={[...parentList, subSection.id]}
                  id={child.id}
                />
              );
            })
          ))}
      </div>
    );
  },
);

export default SubSectionCardSelect;

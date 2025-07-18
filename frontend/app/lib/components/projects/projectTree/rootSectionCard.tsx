import { ProjectSection } from '@/app/lib/types/definitions';
import clsx from 'clsx';
import { el_animation } from '@/app/lib/types/styles';
import { useState } from 'react';
import projectsStore from '@/app/stores/projectsStore';
import { Button } from '@heroui/button';
import { ChevronRightIcon, PlusIcon, TrashIcon } from 'lucide-react';
import SubSectionCard from '@/app/lib/components/projects/projectTree/subSectionCard';
import BoardCard from '@/app/lib/components/projects/projectTree/boardCard';
import { useActiveSectionContext } from '@/app/lib/components/projects/projectTree/projectTree';
import NameInput from '@/app/lib/components/projects/projectTree/nameInput';
import CheckAccess from '@/app/lib/utils/checkAccess';
import { UpdateSection } from '@/app/lib/server/actions/projectServerActions';
import { observer } from 'mobx-react-lite';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';

const RootSectionCard = observer(({ id }: { id: string }) => {
  const section = projectsStore.getProjectChild(id, []) as ProjectSection;
  const { activeNodes, setActiveNodes, removeNode, addNode } =
    useActiveSectionContext();
  const [isReadonly, setIsReadonly] = useState(true);
  const [sectionName, setSectionName] = useState(section.name);
  const [isExpanded, setIsExpanded] = useState(false);

  const updateSectionName = async (newName: string) => {
    setIsReadonly(true);
    if (!projectsStore.activeProject) return;
    await UpdateSection(projectsStore.activeProject.id, section.id, {
      name: newName,
    })
      .catch(() =>
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.project.updateSectionError,
        }),
      )
      .then(() => {
        projectsStore.updateProjectChild([], section.id, {
          name: newName,
          lastChange: new Date().toISOString(),
        });
      });
  };

  return (
    <div
      tabIndex={0}
      onBlur={() => setActiveNodes([])}
      className={clsx(
        'flex flex-col items-start justify-start rounded-2xl',
        'w-full bg-white px-3 py-2 shadow-container hover:bg-default-50',
        'max-h-16 transition-all duration-500',
        !isExpanded && el_animation,
        isExpanded && 'max-h-[1000px]',
      )}
    >
      <div
        onClick={(event) =>
          setActiveNodes(
            event.ctrlKey
              ? [...activeNodes, { id: section.id, parentList: [] }]
              : [{ id: section.id, parentList: [] }],
          )
        }
        className={clsx(
          'group flex w-full cursor-pointer items-center justify-between gap-0 rounded-xl p-1 hover:bg-default-100',
          activeNodes.length &&
            activeNodes.findIndex((node) => node.id == section.id) > -1 &&
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
            isReadonly={
              isReadonly || !CheckAccess(['admin', 'owner', 'editor'])
            }
            setIsReadonly={setIsReadonly}
            onBlur={updateSectionName}
            value={sectionName.toUpperCase()}
            onValueChange={setSectionName}
            upperCase
            size="md"
            maxW="lg"
          />
        </div>
        {CheckAccess(['admin', 'owner', 'editor']) && (
          <div className="invisible flex h-full w-fit items-center justify-end gap-2 pr-2 group-hover:visible">
            <>
              <Button
                isIconOnly
                onPress={() => addNode([section.id])}
                variant="light"
                size="sm"
              >
                <PlusIcon className="stroke-default-500" />
              </Button>
              <Button
                isIconOnly
                onPress={() => removeNode(section.id, [], true)}
                variant="light"
                color="danger"
                size="sm"
              >
                <TrashIcon className="stroke-danger-500" />
              </Button>
            </>
          </div>
        )}
      </div>
      {isExpanded &&
        Array.from(section.children.values()).map((child) => {
          return 'type' in child ? (
            <BoardCard key={child.id} parentList={[section.id]} board={child} />
          ) : (
            <SubSectionCard
              key={child.id}
              parentList={[section.id]}
              id={child.id}
            />
          );
        })}
    </div>
  );
});

export default RootSectionCard;

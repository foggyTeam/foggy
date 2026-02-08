import { ProjectSection } from '@/app/lib/types/definitions';
import { useState } from 'react';
import projectsStore from '@/app/stores/projectsStore';
import clsx from 'clsx';
import { Button } from '@heroui/button';
import { ChevronRightIcon, PlusIcon, TrashIcon } from 'lucide-react';
import BoardCard from '@/app/lib/components/projects/projectTree/boardCard';
import { useActiveSectionContext } from '@/app/lib/components/projects/projectTree/projectTree';
import NameInput from '@/app/lib/components/projects/projectTree/nameInput';
import CheckAccess from '@/app/lib/utils/checkAccess';
import { UpdateSection } from '@/app/lib/server/actions/projectServerActions';
import { Spinner } from '@heroui/spinner';
import { observer } from 'mobx-react-lite';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

const SubSectionCard = observer(
  ({ parentList, id }: { parentList: string[]; id: string }) => {
    const { smallerSize } = useAdaptiveParams();
    const subSection = projectsStore.getProjectChild(
      id,
      parentList,
    ) as ProjectSection;
    const { activeNodes, setActiveNodes, addNode, removeNode, loadSection } =
      useActiveSectionContext();
    const [isReadonly, setIsReadonly] = useState(true);
    const [subSectionName, setSubSectionName] = useState(subSection.name);
    const [isExpanded, setIsExpanded] = useState(false);

    const updateSectionName = async (newName: string) => {
      setIsReadonly(true);
      if (!projectsStore.activeProject) return;
      await UpdateSection(projectsStore.activeProject.id, subSection.id, {
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
          projectsStore.updateProjectChild(parentList, subSection.id, {
            name: newName,
            lastChange: new Date().toISOString(),
          });
        });
    };

    return (
      <div
        aria-expanded={isExpanded}
        data-testid="section-card"
        className={clsx(
          'flex max-h-16 w-full flex-col items-start justify-start py-0.5 pr-0 pl-5 transition-all duration-500 sm:py-1 sm:pl-10',
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
            'hover:bg-default-100 group flex w-full cursor-pointer items-center justify-start gap-0 rounded-xl p-0.5 pr-0 sm:p-1',
            activeNodes.length &&
              activeNodes.findIndex((node) => node.id == subSection.id) > -1 &&
              'bg-primary-100 hover:bg-primary-100',
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
            <NameInput
              isReadonly={
                isReadonly ||
                !CheckAccess(['admin', 'owner', 'editor'], 'project')
              }
              setIsReadonly={setIsReadonly}
              value={subSectionName}
              onValueChange={setSubSectionName}
              onBlur={updateSectionName}
            />
          </div>
          {CheckAccess(['admin', 'owner', 'editor'], 'project') && (
            <div className="flex h-full w-fit items-center justify-end gap-0.5 pr-1 group-hover:visible sm:invisible sm:gap-2 sm:pr-2">
              <Button
                data-testid="add-child-btn"
                isIconOnly
                onPress={() => addNode([...parentList, subSection.id])}
                variant="light"
                size={smallerSize}
              >
                <PlusIcon className="stroke-default-600" />
              </Button>
              <Button
                data-testid="delete-btn"
                isIconOnly
                onPress={() => removeNode(subSection.id, parentList, true)}
                variant="light"
                color="danger"
                size={smallerSize}
              >
                <TrashIcon className="stroke-danger-500" />
              </Button>
            </div>
          )}
        </div>
        {isExpanded &&
          (subSection.childrenNumber !== subSection.children.size ? (
            <Spinner className="w-full p-1" size={smallerSize} />
          ) : (
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
                  id={child.id}
                />
              );
            })
          ))}
      </div>
    );
  },
);

export default SubSectionCard;

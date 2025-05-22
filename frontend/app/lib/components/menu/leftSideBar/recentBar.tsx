'use client';
import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
import { observer } from 'mobx-react-lite';
import { Button } from '@heroui/button';
import { PlusIcon } from 'lucide-react';
import projectsStore from '@/app/stores/projectsStore';
import ElementIcon from '@/app/lib/components/menu/leftSideBar/elementIcon';
import { useDisclosure } from '@heroui/modal';
import {
  Board,
  ProjectElementTypes,
  ProjectSection,
} from '@/app/lib/types/definitions';
import AddProjectElementModal from '@/app/lib/components/projects/addProjectElementModal';
import React from 'react';
import Link from 'next/link';

const RecentBar = observer(({ openSideBar }: { openSideBar: () => void }) => {
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onOpenChange: onAddOpenChange,
  } = useDisclosure();

  const addNode = (nodeName: string, nodeType: ProjectElementTypes) => {
    // TODO: await for id
    switch (nodeType) {
      case 'SECTION':
        const newSection: ProjectSection = {
          children: new Map(),
          childrenNumber: 0,
          id: nodeName,
          name: nodeName,
        };
        projectsStore.addProjectChild([], newSection, true);
        break;
      default:
        const newBoard: Board = {
          id: nodeName,
          name: nodeName,
          type: nodeType,
          layers: [[], [], []],
          sectionId: projectsStore.activeBoard?.sectionId || '',
          lastChange: new Date().toISOString(),
        };
        projectsStore.addProjectChild(
          projectsStore.activeBoardParentList,
          newBoard,
          false,
        );
    }
    onAddOpenChange();
  };

  return (
    <>
      <div
        onClick={openSideBar}
        className={clsx(
          'absolute left-0 top-1/3 z-50 flex w-fit flex-col items-center' +
            ' justify-center gap-1 rounded-l-none rounded-r-[64px] px-3 py-6',
          bg_container,
          'transform transition-all hover:bg-opacity-65 hover:pl-4',
        )}
      >
        {projectsStore.activeBoard && (
          <Button
            as={Link}
            href={`/project/${projectsStore.activeProject?.id}/${projectsStore.activeBoard.sectionId}/${projectsStore.activeBoard.id}`}
            key={projectsStore.activeBoard?.id}
            isIconOnly
            variant="light"
            size="md"
          >
            <ElementIcon
              elementType={projectsStore.activeBoard?.type || 'SIMPLE'}
            />
          </Button>
        )}

        <Button onPress={onAddOpen} isIconOnly variant="light" size="md">
          <PlusIcon className="stroke-default-500" />
        </Button>
      </div>
      {isAddOpen && (
        <AddProjectElementModal
          isOpen={isAddOpen}
          onOpenChange={onAddOpenChange}
          boardOnly={projectsStore.activeBoardParentList.length >= 7}
          sectionOnly={false}
          action={addNode}
        />
      )}
    </>
  );
});

export default RecentBar;

'use client';

import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import LogoBar from '@/app/lib/components/menu/leftSideBar/logoBar';
import RecentBar from '@/app/lib/components/menu/leftSideBar/recentBar';
import { usePathname } from 'next/navigation';
import projectsStore from '@/app/stores/projectsStore';
import OpenedLeftSideBar from '@/app/lib/components/menu/leftSideBar/openedLeftSideBar';
import { useDisclosure } from '@heroui/modal';
import AddProjectElementModal from '@/app/lib/components/projects/addProjectElementModal';
import {
  Board,
  ProjectElementTypes,
  ProjectSection,
} from '@/app/lib/types/definitions';

const LeftSideBar = observer(() => {
  const pathRegex = new RegExp(
    `^/project/[^/]+/[^/]+/${projectsStore.activeBoard?.id}$`,
  );
  const [isOpened, setIsOpened] = useState(false);
  const path = usePathname();
  const [parentList, setParentList] = useState<string[]>([]);
  const [parentSectionId, setParentSectionId] = useState('');

  const {
    isOpen: isAddChildOpen,
    onOpen: onAddChildOpen,
    onOpenChange: onAddChildOpenChange,
  } = useDisclosure();

  useEffect(() => {
    if (!pathRegex.test(path)) setIsOpened(false);
  }, [path]);

  useEffect(() => {
    if (!isAddChildOpen) setParentSectionId('');
  }, [isAddChildOpen]);

  useEffect(() => {
    if (!isOpened) setParentList(projectsStore.activeBoardParentList);
  }, [isOpened]);
  const addNode = (nodeName: string, nodeType: ProjectElementTypes) => {
    // TODO: await for id
    const fullParentList = parentSectionId
      ? [...parentList, parentSectionId]
      : parentList;
    switch (nodeType) {
      case 'SECTION':
        const newSection: ProjectSection = {
          children: new Map(),
          childrenNumber: 0,
          id: nodeName,
          name: nodeName,
        };
        projectsStore.addProjectChild(fullParentList, newSection, true);
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
        projectsStore.addProjectChild(fullParentList, newBoard, false);
    }
    onAddChildOpenChange();
  };

  return (
    <>
      {!isOpened && <LogoBar />}
      {pathRegex.test(path) &&
        (isOpened ? (
          <OpenedLeftSideBar
            isOpened={isOpened}
            closeSideBar={() => setIsOpened(false)}
            parentList={parentList}
            setParentList={setParentList}
            onAddOpen={(newParentSectionId: string) => {
              setParentSectionId(newParentSectionId);
              onAddChildOpen();
            }}
          />
        ) : (
          <RecentBar
            openSideBar={() => setIsOpened(true)}
            onAddOpen={onAddChildOpen}
          />
        ))}
      {isAddChildOpen && (
        <AddProjectElementModal
          isOpen={isAddChildOpen}
          onOpenChange={onAddChildOpenChange}
          boardOnly={
            (parentSectionId ? parentList : projectsStore.activeBoardParentList)
              .length >= 7
          }
          sectionOnly={false}
          action={addNode}
        />
      )}
    </>
  );
});

export default LeftSideBar;

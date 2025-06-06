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
import {
  AddBoard,
  AddSection,
} from '@/app/lib/server/actions/projectServerActions';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';

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
  const addNode = async (nodeName: string, nodeType: ProjectElementTypes) => {
    if (!projectsStore.activeProject) return;
    const fullParentList = parentSectionId
      ? [...parentList, parentSectionId]
      : parentList;
    switch (nodeType) {
      case 'SECTION':
        await AddSection(projectsStore.activeProject.id, {
          name: nodeName,
          parentSectionId,
        })
          .catch(() =>
            addToast({
              color: 'danger',
              severity: 'danger',
              title: settingsStore.t.toasts.project.addSectionError,
            }),
          )
          .then((response: { data: { id: string } }) => {
            const newSection: ProjectSection = {
              children: new Map(),
              childrenNumber: 0,
              id: response.data.id,
              name: nodeName,
            };
            projectsStore.addProjectChild(fullParentList, newSection, true);
          });
        break;
      default:
        await AddBoard(projectsStore.activeProject.id, {
          name: nodeName,
          type: nodeType.toLowerCase(),
          sectionId: parentSectionId,
        })
          .catch(() =>
            addToast({
              color: 'danger',
              severity: 'danger',
              title: settingsStore.t.toasts.board.addBoardError,
            }),
          )
          .then((response: { data: { id: string } }) => {
            const newBoard: Board = {
              id: response.data.id,
              name: nodeName,
              type: nodeType,
              layers: [[], [], []],
              sectionId: projectsStore.activeBoard?.sectionId || '',
              lastChange: new Date().toISOString(),
            };
            projectsStore.addProjectChild(fullParentList, newBoard, false);
          });
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

'use client';

import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import LogoBar from '@/app/lib/components/menu/leftSideBar/logoBar';
import RecentBar from '@/app/lib/components/menu/leftSideBar/recentBar';
import { usePathname, useRouter } from 'next/navigation';
import projectsStore from '@/app/stores/projectsStore';
import OpenedLeftSideBar from '@/app/lib/components/menu/leftSideBar/openedLeftSideBar';
import { useDisclosure } from '@heroui/modal';
import AddProjectElementModal from '@/app/lib/components/projects/addProjectElementModal';
import {
  Board,
  BoardTypes,
  GraphBoard,
  ProjectElementTypes,
  ProjectSection,
  SimpleBoard,
} from '@/app/lib/types/definitions';
import {
  AddBoard,
  AddSection,
} from '@/app/lib/server/actions/projectServerActions';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import boardStore from '@/app/stores/board/boardStore';
import { GenerateBoardTemplate } from '@/app/lib/server/ai/aiServerActions';

const LeftSideBar = observer(() => {
  const pathRegex = new RegExp(
    `^/project/[^/]+/[^/]+/${boardStore.activeBoard?.id}/(simple|graph|doc)$`,
  );
  const [isOpened, setIsOpened] = useState(false);
  const path = usePathname();
  const router = useRouter();
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
  const addNode = async (
    nodeName: string,
    nodeType: ProjectElementTypes,
    needsTemplate?: boolean,
    prompt?: string,
  ) => {
    if (!projectsStore.activeProject || !boardStore.activeBoard) return;
    const fullParentList = isOpened
      ? parentSectionId
        ? [...parentList, parentSectionId]
        : parentList
      : parentList;

    switch (nodeType) {
      case 'SECTION':
        try {
          const response = await AddSection(projectsStore.activeProject.id, {
            name: nodeName,
            parentSectionId: isOpened
              ? parentSectionId
              : boardStore.activeBoard.sectionId,
          });
          if ('errors' in response)
            throw new Error(Object.values(response.errors)[0]);
          const newSection: ProjectSection = {
            children: new Map(),
            childrenNumber: 0,
            id: response.data.id,
            name: nodeName,
          };
          projectsStore.addProjectChild(fullParentList, newSection, true);
        } catch (e: any) {
          addToast({
            color: 'danger',
            severity: 'danger',
            title: settingsStore.t.toasts.project.addSectionError,
            description: e?.message || undefined,
          });
        }
        break;
      default:
        try {
          const response = await AddBoard(projectsStore.activeProject.id, {
            name: nodeName,
            type: nodeType.toLowerCase(),
            sectionId: isOpened
              ? parentSectionId
              : boardStore.activeBoard.sectionId,
          });
          if ('errors' in response)
            throw new Error(Object.values(response.errors)[0]);

          const data:
            | Pick<SimpleBoard, 'layers'>
            | Pick<GraphBoard, 'graphNodes' | 'graphEdges'>
            | string =
            nodeType === 'SIMPLE'
              ? { layers: [[], [], []] }
              : nodeType === 'GRAPH'
                ? { graphEdges: [], graphNodes: [] }
                : '';
          const newId = response.data.id;
          const sectionId = boardStore.activeBoard?.sectionId || '';
          const newBoard = {
            id: newId,
            name: nodeName,
            type: nodeType,
            sectionId,
            lastChange: new Date().toISOString(),
          };
          projectsStore.addProjectChild(
            fullParentList,
            Object.assign(newBoard, data) as Board,
            false,
          );
          if (needsTemplate) {
            onAddChildOpenChange();
            await generateTemplate(
              newBoard.id,
              newBoard.name,
              newBoard.type,
              prompt,
            );
          }
          router.push(
            `/project/${projectsStore.activeProject?.id}/${sectionId}/${newId}/${nodeType.toLowerCase()}`,
          );
          if (!needsTemplate) onAddChildOpenChange();
        } catch (e: any) {
          addToast({
            color: 'danger',
            severity: 'danger',
            title: settingsStore.t.toasts.board.addBoardError,
            description: e?.message || undefined,
          });
        }
    }
  };

  async function generateTemplate(
    boardId: Board['id'],
    boardName: string,
    boardType: BoardTypes,
    prompt?: string,
  ) {
    settingsStore.startAiLoading();
    try {
      const result = await GenerateBoardTemplate(
        boardId,
        boardName,
        boardType,
        prompt,
      );
      if (!result) throw new Error();
    } catch (e: any) {
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.board.generateTemplateError,
        description: e?.message || undefined,
      });
    }
    settingsStore.endAiLoading();
  }

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

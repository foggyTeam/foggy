import { observer } from 'mobx-react-lite';
import projectsStore from '@/app/stores/projectsStore';
import RootSectionCard from '@/app/lib/components/projects/projectTree/rootSectionCard';
import React, { createContext, useContext, useState } from 'react';
import AddRootSectionButton from '@/app/lib/components/projects/projectTree/addRootSectionButton';
import settingsStore from '@/app/stores/settingsStore';
import AreYouSureModal from '@/app/lib/components/modals/areYouSureModal';
import { useDisclosure } from '@heroui/modal';
import AddProjectElementModal from '@/app/lib/components/projects/addProjectElementModal';
import {
  Board,
  GraphBoard,
  ProjectElementTypes,
  ProjectSection,
  SimpleBoard,
} from '@/app/lib/types/definitions';
import CheckAccess from '@/app/lib/utils/checkAccess';
import {
  AddBoard,
  AddSection,
  DeleteBoard,
  DeleteSection,
  GetSection,
} from '@/app/lib/server/actions/projectServerActions';
import { addToast } from '@heroui/toast';
import aiStore from '@/app/stores/board/aiStore';

interface ActiveNodeContextType {
  activeNodes: { id: string; parentList: string[] }[];
  setActiveNodes: (nodes: { id: string; parentList: string[] }[]) => void;
  loadSection: (id: string, parentList: string[]) => void;
  removeNode: (id: string, parentList: string[], isSection?: boolean) => void;
  addNode: (parentList: string[]) => void;
}
const ActiveNodeContext = createContext<ActiveNodeContextType | null>(null);
export const useActiveSectionContext = () => {
  const context = useContext(ActiveNodeContext);
  if (!context)
    throw new Error(
      'useActiveSectionContext must be used within a ActiveSectionContextProvider',
    );
  return context;
};

const ProjectTree = observer(() => {
  const {
    isOpen: isDeleteChildOpen,
    onOpen: onDeleteChildOpen,
    onOpenChange: onDeleteChildOpenChange,
  } = useDisclosure();
  const {
    isOpen: isAddChildOpen,
    onOpen: onAddChildOpen,
    onOpenChange: onAddChildOpenChange,
  } = useDisclosure();
  const [activeNodes, setActiveNodes] = useState<
    { id: string; parentList: string[] }[]
  >([]);
  const [nodeToRemove, setNodeToRemove] = useState<{
    id: string;
    parentList: string[];
    isSection: boolean;
  } | null>(null);
  const [newNodeParentList, setNewNodeParentList] = useState<string[]>([]);

  const openRemoveNodeModal = (
    id: string,
    parentList: string[],
    isSection?: boolean,
  ) => {
    setNodeToRemove({ id: id, parentList: parentList, isSection: !!isSection });
    onDeleteChildOpen();
  };
  const removeNode = async () => {
    if (nodeToRemove && projectsStore.activeProject) {
      if (nodeToRemove.isSection) {
        await DeleteSection(projectsStore.activeProject.id, nodeToRemove.id)
          .catch(() =>
            addToast({
              color: 'danger',
              severity: 'danger',
              title: settingsStore.t.toasts.project.deleteSectionError,
            }),
          )
          .then(() => {
            projectsStore.deleteProjectChild(
              nodeToRemove.id,
              nodeToRemove.parentList,
            );
          });
      } else {
        await DeleteBoard(nodeToRemove.id)
          .catch(() =>
            addToast({
              color: 'danger',
              severity: 'danger',
              title: settingsStore.t.toasts.board.deleteBoardError,
            }),
          )
          .then(() => {
            projectsStore.deleteProjectChild(
              nodeToRemove.id,
              nodeToRemove.parentList,
            );
            addToast({
              color: 'success',
              severity: 'success',
              title: settingsStore.t.toasts.board.deleteBoardSuccess,
            });
          });
      }
    }
    setNodeToRemove(null);
    onDeleteChildOpenChange();
  };

  const openAddNodeModal = (parentList: string[]) => {
    setNewNodeParentList(parentList);
    onAddChildOpen();
  };

  const addNode = async (
    nodeName: string,
    nodeType: ProjectElementTypes,
    needsTemplate?: boolean,
    prompt?: string,
  ) => {
    if (!projectsStore.activeProject) return;

    const parentSectionId = newNodeParentList[newNodeParentList.length - 1];
    switch (nodeType) {
      case 'SECTION':
        try {
          const response = await AddSection(projectsStore.activeProject.id, {
            name: nodeName,
            parentSectionId,
          });
          if ('errors' in response)
            throw new Error(Object.values(response.errors)[0]);

          const newSection: ProjectSection = {
            children: new Map(),
            childrenNumber: 0,
            id: response.data.id,
            name: nodeName,
          };
          projectsStore.addProjectChild(newNodeParentList, newSection, true);
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
          const boardData:
            | Pick<SimpleBoard, 'layers'>
            | Pick<GraphBoard, 'graphNodes' | 'graphEdges'>
            | string =
            nodeType === 'SIMPLE'
              ? { layers: [[], [], []] }
              : nodeType === 'GRAPH'
                ? { graphEdges: [], graphNodes: [] }
                : '';
          const newBoard = {
            name: nodeName,
            type: nodeType,
            sectionId: parentSectionId,
            lastChange: new Date().toISOString(),
            ...boardData,
          };

          if (needsTemplate) {
            await aiStore.generateTemplate(
              newBoard,
              prompt,
              (result: { boardId: string } | null) => {
                // TODO: proceed
                if (result === null) {
                  console.error('Failed to add board');
                  return;
                }
                projectsStore.addProjectChild(
                  newNodeParentList,
                  Object.assign(newBoard, { id: result.boardId }) as Board,
                  false,
                );
              },
            );
            onAddChildOpenChange();
            return;
          }

          const response = await AddBoard(projectsStore.activeProject.id, {
            name: nodeName,
            type: nodeType.toLowerCase(),
            sectionId: parentSectionId,
          });
          if ('errors' in response)
            throw new Error(Object.values(response.errors)[0]);

          const newId = response.data.id;
          projectsStore.addProjectChild(
            newNodeParentList,
            Object.assign(newBoard, { id: newId }) as Board,
            false,
          );
        } catch (e: any) {
          addToast({
            color: 'danger',
            severity: 'danger',
            title: settingsStore.t.toasts.board.addBoardError,
            description: e?.message || undefined,
          });
        }
    }
    onAddChildOpenChange();
  };

  const loadSection = async (id: string, parentList: string[]) => {
    if (!projectsStore.activeProject) return;
    await GetSection(projectsStore.activeProject.id, id)
      .catch(() =>
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.project.getSectionError,
        }),
      )
      .then((result) => {
        projectsStore.insertProjectChild(parentList, result);
      });
  };

  return (
    <>
      <ActiveNodeContext.Provider
        value={{
          activeNodes: activeNodes,
          setActiveNodes: setActiveNodes,
          loadSection: loadSection,
          removeNode: openRemoveNodeModal,
          addNode: openAddNodeModal,
        }}
      >
        <div className="flex h-fit w-full flex-col gap-2 pr-2 pb-16">
          {CheckAccess(['admin', 'owner', 'editor'], 'project') && (
            <AddRootSectionButton
              title={settingsStore.t.projects.addSection}
              onPress={openAddNodeModal}
            />
          )}
          {projectsStore.activeProject?.sections &&
            Array.from(projectsStore.activeProject?.sections?.values()).map(
              (section) => <RootSectionCard key={section.id} id={section.id} />,
            )}
        </div>
      </ActiveNodeContext.Provider>
      {isDeleteChildOpen && (
        <AreYouSureModal
          isOpen={isDeleteChildOpen}
          onOpenChange={onDeleteChildOpenChange}
          action={removeNode}
          header={settingsStore.t.projects.deleteProjectChild.modalHeader}
          sure={settingsStore.t.projects.deleteProjectChild.modalSure}
          dismiss={settingsStore.t.projects.deleteProjectChild.modalDismiss}
        />
      )}
      {isAddChildOpen && (
        <AddProjectElementModal
          isOpen={isAddChildOpen}
          onOpenChange={onAddChildOpenChange}
          boardOnly={newNodeParentList.length >= 7}
          sectionOnly={newNodeParentList.length === 0}
          action={addNode}
        />
      )}
    </>
  );
});

export default ProjectTree;

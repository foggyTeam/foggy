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
  ProjectElementTypes,
  ProjectSection,
} from '@/app/lib/types/definitions';

interface ActiveNodeContextType {
  activeNodes: { id: string; parentList: string[] }[];
  setActiveNodes: (nodes: { id: string; parentList: string[] }[]) => void;
  removeNode: (id: string, parentList: string[]) => void;
  addNode: (parentList: string[]) => void;
}
const ActiveNodeContext = createContext<ActiveNodeContextType | null>(null);
export const useActiveSectionContext = () => {
  const context = useContext(ActiveNodeContext);
  if (!context)
    throw new Error('useMyContext must be used within a MyContextProvider');
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
  } | null>(null);
  const [newNodeParentList, setNewNodeParentList] = useState<string[]>([]);

  const removeNode = (id: string, parentList: string[]) => {
    setNodeToRemove({ id: id, parentList: parentList });
    onDeleteChildOpen();
  };

  const openAddNodeModal = (parentList: string[]) => {
    setNewNodeParentList(parentList);
    onAddChildOpen();
  };

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
        projectsStore.addProjectChild(newNodeParentList, newSection, true);
        break;
      default:
        const newBoard: Board = {
          id: nodeName,
          name: nodeName,
          type: nodeType,
          layers: [[], [], []],
          sectionId: newNodeParentList[newNodeParentList.length - 1],
          lastChange: new Date().toISOString(),
        };
        projectsStore.addProjectChild(newNodeParentList, newBoard, false);
    }
    onAddChildOpenChange();
  };

  return (
    <>
      <ActiveNodeContext.Provider
        value={{
          activeNodes: activeNodes,
          setActiveNodes: setActiveNodes,
          removeNode: removeNode,
          addNode: openAddNodeModal,
        }}
      >
        <div className="flex h-fit w-full flex-col gap-2 pb-16 pr-2">
          <AddRootSectionButton
            title={settingsStore.t.projects.addSection}
            onPress={openAddNodeModal}
          />
          {projectsStore.activeProject?.sections &&
            Array.from(projectsStore.activeProject?.sections?.values()).map(
              (section) => (
                <RootSectionCard key={section.id} section={section} />
              ),
            )}
        </div>
      </ActiveNodeContext.Provider>
      {isDeleteChildOpen && (
        <AreYouSureModal
          isOpen={isDeleteChildOpen}
          onOpenChange={onDeleteChildOpenChange}
          action={() => {
            if (nodeToRemove) {
              projectsStore.deleteProjectChild(
                nodeToRemove.id,
                nodeToRemove.parentList,
              );
            }
            setNodeToRemove(null);
            onDeleteChildOpenChange();
          }}
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

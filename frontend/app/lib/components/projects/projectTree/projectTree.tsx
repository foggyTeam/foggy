import { observer } from 'mobx-react-lite';
import projectsStore from '@/app/stores/projectsStore';
import RootSectionCard from '@/app/lib/components/projects/projectTree/rootSectionCard';
import React, { createContext, useContext, useState } from 'react';
import AddRootSectionButton from '@/app/lib/components/projects/projectTree/addRootSectionButton';
import settingsStore from '@/app/stores/settingsStore';
import AreYouSureModal from '@/app/lib/components/areYouSureModal';
import { useDisclosure } from '@heroui/modal';

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
  const [activeNodes, setActiveNodes] = useState([]);
  const [nodeToRemove, setNodeToRemove] = useState<{
    id: string;
    parentList: string[];
  }>(null);

  const removeNode = (id: string, parentList: string[]) => {
    setNodeToRemove({ id: id, parentList: parentList });
    onDeleteChildOpen(true);
  };

  const addNode = (parentList: string[]) => {
    console.log('adding', parentList);
  };

  return (
    <>
      <ActiveNodeContext.Provider
        value={{
          activeNodes: activeNodes,
          setActiveNodes: setActiveNodes,
          removeNode: removeNode,
          addNode: addNode,
        }}
      >
        <div className="flex h-fit w-full flex-col gap-2 pb-16 pr-2">
          <AddRootSectionButton
            title={settingsStore.t.projects.addSection}
            onPress={addNode}
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
            projectsStore.deleteProjectChild(
              nodeToRemove.id,
              nodeToRemove.parentList,
            );
            setNodeToRemove(null);
            onDeleteChildOpenChange();
          }}
          header={settingsStore.t.projects.deleteProjectChild.modalHeader}
          sure={settingsStore.t.projects.deleteProjectChild.modalSure}
          dismiss={settingsStore.t.projects.deleteProjectChild.modalDismiss}
        />
      )}
    </>
  );
});

export default ProjectTree;

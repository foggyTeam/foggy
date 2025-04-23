import { observer } from 'mobx-react-lite';
import projectsStore from '@/app/stores/projectsStore';
import RootSectionCard from '@/app/lib/components/projects/projectTree/rootSectionCard';
import React, { createContext, useContext, useState } from 'react';

interface ActiveNodeContextType {
  activeNode: { id: string; parentList: string[] };
  setActiveNode: ({
    id,
    parentList,
  }: {
    id: string;
    parentList: string[];
  }) => void;
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
  const [activeNode, setActiveNode] = useState(null);

  const removeNode = (id: string, parentList: string[]) => {
    console.log('removing', id);
  };

  const addNode = (parentList: string[]) => {
    console.log('adding', parentList);
  };

  return (
    <ActiveNodeContext.Provider
      value={{
        activeNode: activeNode,
        setActiveNode: setActiveNode,
        removeNode: removeNode,
        addNode: addNode,
      }}
    >
      <div className="flex h-fit w-full flex-col gap-2 pb-16 pr-2">
        {projectsStore.activeProject?.sections &&
          Array.from(projectsStore.activeProject?.sections?.values()).map(
            (section) => <RootSectionCard key={section.id} section={section} />,
          )}
      </div>
    </ActiveNodeContext.Provider>
  );
});

export default ProjectTree;

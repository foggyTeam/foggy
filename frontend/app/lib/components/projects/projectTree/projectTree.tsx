import { observer } from 'mobx-react-lite';
import projectsStore from '@/app/stores/projectsStore';
import RootSectionCard from '@/app/lib/components/projects/projectTree/rootSectionCard';
import React from 'react';

const ProjectTree = observer(() => {
  return (
    <div className="flex h-fit w-full flex-col gap-2 pb-16 pr-2">
      {projectsStore.activeProject?.sections &&
        Array.from(projectsStore.activeProject?.sections?.values()).map(
          (section) => <RootSectionCard key={section.id} section={section} />,
        )}
    </div>
  );
});

export default ProjectTree;

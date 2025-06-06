'use client';

import ContentSection from '@/app/lib/components/contentSection';
import settingsStore from '@/app/stores/settingsStore';
import projectsStore from '@/app/stores/projectsStore';
import { observer } from 'mobx-react-lite';
import ProjectCard from '@/app/lib/components/projects/projectCard';
import { useDisclosure } from '@heroui/modal';
import ProjectSettingsModal from '@/app/lib/components/projects/projectSettingsModal';

const AllProjects = observer(() => {
  const {
    isOpen: isCreateProjectOpen,
    onOpen: onCreateProjectOpen,
    onOpenChange: onCreateProjectOpenChange,
  } = useDisclosure();

  return (
    <>
      <ContentSection
        sectionTitle={settingsStore.t.main.myProjects}
        data={projectsStore.allProjects.slice()}
        DataCard={ProjectCard}
        filter
        onlyFavorite
        onlyWithNotification
        addNew={onCreateProjectOpen}
      />
      {isCreateProjectOpen && (
        <ProjectSettingsModal
          isNewProject={true}
          isOpen={isCreateProjectOpen}
          onOpenChange={onCreateProjectOpenChange}
        />
      )}
    </>
  );
});

export default AllProjects;

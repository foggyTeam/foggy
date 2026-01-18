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
        data-testid="all-projects"
        sectionTitle={settingsStore.t.main.myProjects}
        data={projectsStore.allProjects.slice()}
        DataCard={ProjectCard}
        filter
        emptyState={{
          title: settingsStore.t.main.emptyProjects.title,
          text: settingsStore.t.main.emptyProjects.text,
          illustrationType: 'search',
          rightButton: {
            title: settingsStore.t.main.emptyProjects.action,
            callback: onCreateProjectOpen,
          },
        }}
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

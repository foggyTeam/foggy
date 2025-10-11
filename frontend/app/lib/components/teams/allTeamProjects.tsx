'use client';

import ContentSection from '@/app/lib/components/contentSection';
import settingsStore from '@/app/stores/settingsStore';
import ProjectCard from '@/app/lib/components/projects/projectCard';
import teamsStore from '@/app/stores/teamsStore';
import { useDisclosure } from '@heroui/modal';
import ProjectSettingsModal from '@/app/lib/components/projects/projectSettingsModal';
import { observer } from 'mobx-react-lite';

const AllTeamProjects = observer(() => {
  const {
    isOpen: isCreateProjectOpen,
    onOpen: onCreateProjectOpen,
    onOpenChange: onCreateProjectOpenChange,
  } = useDisclosure();

  return (
    <>
      <ContentSection
        sectionTitle={settingsStore.t.team.teamProject.replace(
          '_',
          (teamsStore.activeTeam?.name ?? '').toUpperCase(),
        )}
        emptyState={{
          title: settingsStore.t.main.emptyProjects.title,
          text: settingsStore.t.main.emptyProjects.text,
          illustrationType: 'search',
          action: {
            title: settingsStore.t.main.emptyProjects.action,
            callback: onCreateProjectOpen,
          },
        }}
        data={teamsStore.activeTeam?.projects?.slice() ?? []}
        DataCard={ProjectCard}
        filter
        type="team"
        onlyWithNotification
        addNew={onCreateProjectOpen}
      />
      {isCreateProjectOpen && (
        <ProjectSettingsModal
          isTeamProject={true}
          isNewProject={true}
          isOpen={isCreateProjectOpen}
          onOpenChange={onCreateProjectOpenChange}
        />
      )}
    </>
  );
});

export default AllTeamProjects;

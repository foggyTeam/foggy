'use client';

import ContentSection from '@/app/lib/components/contentSection';
import settingsStore from '@/app/stores/settingsStore';
import ProjectCard from '@/app/lib/components/projects/projectCard';
import teamsStore from '@/app/stores/teamsStore';

export default function AllTeamProjects() {
  return (
    <>
      <ContentSection
        sectionTitle={settingsStore.t.team.teamProject.replace(
          '_',
          teamsStore.activeTeam?.name.toUpperCase(),
        )}
        data={teamsStore.activeTeam?.projects?.slice() ?? []}
        DataCard={ProjectCard}
        filter
        type="team"
        onlyWithNotification
        addNew={() => console.log('new project')}
      />
    </>
  );
}

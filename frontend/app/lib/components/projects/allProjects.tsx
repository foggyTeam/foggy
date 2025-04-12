'use client';

import { Project } from '@/app/lib/types/definitions';
import ContentSection from '@/app/lib/components/contentSection';
import settingsStore from '@/app/stores/settingsStore';

export default function AllProjects({ projects }: { projects: Project[] }) {
  const addNewProject = () => {
    console.log('New project');
  };

  return (
    <ContentSection
      sectionTitle={settingsStore.t.main.myProjects}
      data={projects}
      DataCard={() => <span>I am data</span>}
      filter
      onlyFavorite
      onlyWithNotification
      addNew={addNewProject}
    />
  );
}

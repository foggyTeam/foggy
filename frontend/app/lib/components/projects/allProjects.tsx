'use client';

import ContentSection from '@/app/lib/components/contentSection';
import settingsStore from '@/app/stores/settingsStore';
import projectsStore from '@/app/stores/projectsStore';
import { observer } from 'mobx-react-lite';

const AllProjects = observer(() => {
  const addNewProject = () => {
    console.log('New project');
  };

  return (
    <ContentSection
      sectionTitle={settingsStore.t.main.myProjects}
      data={projectsStore.allProjects.slice()}
      DataCard={() => <span>I am data</span>}
      filter
      onlyFavorite
      onlyWithNotification
      addNew={addNewProject}
    />
  );
});

export default AllProjects;

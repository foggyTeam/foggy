'use client';

import { useEffect } from 'react';
import userStore from '@/app/stores/userStore';
import { Project } from '@/app/lib/types/definitions';
import projectsStore from '@/app/stores/projectsStore';

const ProjectsLoader = ({
  projectsData,
}: {
  projectsData: Project[] | undefined;
}) => {
  useEffect(() => {
    if (projectsData && userStore.isAuthenticated) {
      projectsStore.setAllProjects(projectsData);
    }
  }, [projectsData]);

  return null;
};

export default ProjectsLoader;

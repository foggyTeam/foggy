'use client';

import { useEffect } from 'react';
import { Project } from '@/app/lib/types/definitions';
import projectsStore from '@/app/stores/projectsStore';

export default function ProjectLoader({
  projectData,
}: {
  projectData: Project | undefined;
}) {
  useEffect(() => {
    if (projectData) {
      projectsStore.setActiveProject(projectData);
    }
  }, [projectData]);

  return null;
}

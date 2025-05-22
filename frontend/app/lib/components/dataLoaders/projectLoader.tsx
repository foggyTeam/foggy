'use client';

import { useEffect } from 'react';
import { RawProject } from '@/app/lib/types/definitions';
import projectsStore from '@/app/stores/projectsStore';

export default function ProjectLoader({
  projectData,
}: {
  projectData: RawProject | undefined;
}) {
  useEffect(() => {
    if (projectData) projectsStore.setActiveProject(projectData);
    return () => projectsStore.setActiveProject(null);
  }, [projectData]);

  return null;
}

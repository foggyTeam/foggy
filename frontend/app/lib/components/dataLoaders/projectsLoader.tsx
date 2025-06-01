'use client';

import { useEffect } from 'react';
import userStore from '@/app/stores/userStore';
import { Project } from '@/app/lib/types/definitions';
import projectsStore from '@/app/stores/projectsStore';
import { GetAllProjects } from '@/app/lib/server/actions/projectServerActions';
import useSWR from 'swr';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';

const ProjectsLoader = ({
  projectsData,
}: {
  projectsData: Project[] | undefined;
}) => {
  const { data: revalidatedData, error } = useSWR(
    projectsData ? 'allProjects' : null,
    () => (projectsData ? GetAllProjects() : undefined),
    {
      fallbackData: projectsData,
      revalidateOnFocus: true,
      refreshInterval: 300000, // 5 минут
    },
  );

  useEffect(() => {
    if (projectsData && userStore.isAuthenticated) {
      projectsStore.setAllProjects(projectsData);
    }
  }, [projectsData]);

  useEffect(() => {
    if (revalidatedData && !error)
      projectsStore.setAllProjects(revalidatedData);
    else
      addToast({
        severity: 'danger',
        title: settingsStore.t.toasts.updateProjectsError,
      });
  }, [projectsData, revalidatedData]);

  return null;
};

export default ProjectsLoader;

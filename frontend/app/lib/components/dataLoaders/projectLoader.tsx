'use client';

import { useEffect } from 'react';
import { RawProject } from '@/app/lib/types/definitions';
import projectsStore from '@/app/stores/projectsStore';
import useSWR from 'swr';
import { GetProject } from '@/app/lib/server/actions/projectServerActions';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';

export default function ProjectLoader({
  projectData,
}: {
  projectData: RawProject | undefined;
}) {
  const { data: revalidatedData, error } = useSWR(
    projectData ? projectData.id : null,
    () => (projectData ? GetProject(projectData.id) : undefined),
    {
      fallbackData: projectData,
      revalidateOnFocus: true,
      refreshInterval: 120000, // 2 минуты
    },
  );

  useEffect(() => {
    if (projectData) projectsStore.setActiveProject(projectData);
    return () => projectsStore.setActiveProject(null);
  }, [projectData]);

  useEffect(() => {
    if (revalidatedData.id !== projectsStore.activeProject?.id) return;
    if (!error && revalidatedData)
      projectsStore.revalidateActiveProject(revalidatedData);
    else
      addToast({
        severity: 'danger',
        title: settingsStore.t.toasts.project.updateProjectError,
      });
  }, [projectData, revalidatedData, error]);

  return null;
}

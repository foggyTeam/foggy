'use client';

import { useEffect } from 'react';
import { RawProject } from '@/app/lib/types/definitions';
import projectsStore from '@/app/stores/projectsStore';
import useSWR from 'swr';
import { GetProject } from '@/app/lib/server/actions/projectServerActions';

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
    else console.error('Не удалось обновить данные проекта');
  }, [projectData, revalidatedData, error]);

  return null;
}

import React from 'react';
import projectShortData from '@/app/mockData/projectShortData.json';
import { Project } from '@/app/lib/types/definitions';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import ProjectRequest from '@/app/lib/components/projects/projectRequest';
import { GetShortProjectInfo } from '@/app/lib/server/actions/projectServerActions';
import { notFound, redirect } from 'next/navigation';

async function getProjectInfo(id: string): Promise<Project | undefined> {
  const project = await GetShortProjectInfo(id);

  if (!project.settings.isPublic) redirect(`/forbidden?type=project`);

  if (!project) notFound();

  return project;
}

export default async function ProjectRequestPage({
  params,
}: Readonly<{
  params: Promise<{ project_id: string }>;
}>) {
  const { project_id } = await params;
  const projectData = await getProjectInfo(project_id);

  return (
    <div className="flex h-screen w-screen items-center justify-center px-24 py-8">
      <div
        className={clsx(
          'flex h-fit min-h-56 w-full max-w-xl items-center justify-center',
          bg_container_no_padding,
          'rounded-br-[64px] p-8',
        )}
      >
        <ProjectRequest project={projectData} />
      </div>
    </div>
  );
}

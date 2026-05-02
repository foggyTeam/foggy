import React from 'react';
import { RawProject } from '@/app/lib/types/definitions';
import ProjectLoader from '@/app/lib/components/dataLoaders/projectLoader';
import { GetProject } from '@/app/lib/server/actions/projectServerActions';
import { notFound, redirect } from 'next/navigation';
import AiLoadingCard from '@/app/lib/components/board/ai/aiLoadingCard';

interface ProjectPageProps {
  project_id: string;
}

async function getProject(id: string): Promise<RawProject | undefined> {
  const project = await GetProject(id);
  if (project?.status === 403) {
    redirect(`/project/request/${id}`);
    return;
  }

  if (!project) notFound();
  return project;
}
export default async function ProjectLayout({
  params,
  children,
}: Readonly<{
  params: Promise<ProjectPageProps>;
  children: React.ReactNode;
}>) {
  const { project_id } = await params;
  const projectData = await getProject(project_id);

  return (
    <>
      <ProjectLoader projectData={projectData} />
      <AiLoadingCard />
      {children}
    </>
  );
}

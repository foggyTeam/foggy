import React from 'react';
import { RawProject } from '@/app/lib/types/definitions';
import ProjectLoader from '@/app/lib/components/dataLoaders/projectLoader';
import { GetProject } from '@/app/lib/server/actions/projectServerActions';
import { notFound } from 'next/navigation';

interface ProjectPageProps {
  project_id: string;
}

async function getProject(id: string): Promise<RawProject | undefined> {
  const project = await GetProject(id);
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
      {children}
    </>
  );
}

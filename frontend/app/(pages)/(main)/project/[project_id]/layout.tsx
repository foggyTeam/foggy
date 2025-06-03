import React from 'react';
import { RawProject } from '@/app/lib/types/definitions';
import ProjectLoader from '@/app/lib/components/dataLoaders/projectLoader';
import { GetProject } from '@/app/lib/server/actions/projectServerActions';

interface ProjectPageProps {
  project_id: string;
}

async function getProject(id: string): Promise<RawProject | undefined> {
  try {
    return await GetProject(id);
  } catch (e) {
    console.error(e);
    return undefined;
  }
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

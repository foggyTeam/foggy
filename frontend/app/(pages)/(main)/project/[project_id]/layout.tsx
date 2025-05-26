import React from 'react';
import { RawProject } from '@/app/lib/types/definitions';
import project from '@/app/mockData/project.json';
import ProjectLoader from '@/app/lib/components/dataLoaders/projectLoader';

interface ProjectPageProps {
  project_id: string;
}

async function getProject(id: string): Promise<RawProject | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(project as RawProject), 300);
  });
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

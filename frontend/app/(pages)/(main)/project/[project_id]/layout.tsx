import React from 'react';
import { RawProject } from '@/app/lib/types/definitions';
import ProjectLoader from '@/app/lib/components/dataLoaders/projectLoader';
import { getRequest } from '@/app/lib/server/requests';
import getUserId from '@/app/lib/getUserId';
import { signOut } from '@/auth';

interface ProjectPageProps {
  project_id: string;
}

async function getProject(id: string): Promise<RawProject | undefined> {
  try {
    return await getRequest(`projects/${id}`, {
      headers: {
        'x-user-id': await getUserId(),
      },
    });
  } catch (e) {
    console.error('Project with this id does not exist.', e);
    await signOut();
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

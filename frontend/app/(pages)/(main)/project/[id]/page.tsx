import ProjectLoader from '@/app/lib/components/dataLoaders/projectLoader';
import { Project } from '@/app/lib/types/definitions';
import { getRequest } from '@/app/lib/server/requests';
import { undefined } from 'zod';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

async function getProject(id: string): Promise<Project | undefined> {
  const response = await getRequest(`project/${id}`);
  if (response) {
    const projectData: Project = {
      id: response.id,
      name: response.name,
      avatar: response.avatar,
      description: response.description,
      settings: response.settings,
      sections: response.sections,
      lastChange: response.lastChange,
      members: response.members,
    };

    if (projectData) return projectData;
  }
  return undefined;
}

export default async function ProjectPage({
  params,
}: Promise<ProjectPageProps>) {
  const { id } = await params;
  const projectData = await getProject(id);

  return (
    <>
      <ProjectLoader projectData={projectData} />
    </>
  );
}

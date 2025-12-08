import React from 'react';
import teamShortData from '@/app/mockData/team.json';
import { Team } from '@/app/lib/types/definitions';

async function getTeamInfo(id: string): Promise<Team | undefined> {
  //TODO: uncomment when API ready
  //const project = await GetProject(id);
  //if (project?.status === 403) redirect(`/project/request/${id}`);

  //if (!project) notFound();

  return new Promise((resolve) => {
    setTimeout(() => resolve(teamShortData as Team), 300);
  });
}

export default async function TeamRequestPage({
  params,
  children,
}: Readonly<{
  params: Promise<{ team_id: string }>;
  children: React.ReactNode;
}>) {
  const { team_id } = await params;
  const teamData = await getTeamInfo(team_id);
}

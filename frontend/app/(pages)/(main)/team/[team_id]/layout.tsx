import React from 'react';
import { RawTeam, TeamSettings } from '@/app/lib/types/definitions';
import { notFound } from 'next/navigation';
import activeTeam from '@/app/mockData/team.json';
import TeamLoader from '@/app/lib/components/dataLoaders/teamLoader';

interface TeamPageProps {
  team_id: string;
}

async function getTeam(id: string): Promise<RawTeam | undefined> {
  // TODO: uncomment when API ready
  // const team = await GetTeam(id);
  const team: Promise<RawTeam> = new Promise((resolve) =>
    setTimeout(
      () => resolve({ ...activeTeam, settings: new TeamSettings() } as any),
      300,
    ),
  );
  if (!team) notFound();
  return team;
}
export default async function TeamLayout({
  params,
  children,
}: Readonly<{
  params: Promise<TeamPageProps>;
  children: React.ReactNode;
}>) {
  const { team_id } = await params;
  const teamData = await getTeam(team_id);

  return (
    <>
      <TeamLoader teamData={teamData} />
      {children}
    </>
  );
}

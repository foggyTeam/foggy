import React from 'react';
import { RawTeam } from '@/app/lib/types/definitions';
import { notFound, redirect } from 'next/navigation';
import TeamLoader from '@/app/lib/components/dataLoaders/teamLoader';
import { GetTeam } from '@/app/lib/server/actions/teamServerActions';

interface TeamPageProps {
  team_id: string;
}

async function getTeam(id: string): Promise<RawTeam | undefined> {
  const team = await GetTeam(id);
  if (team?.status === 403) {
    redirect(`/team/request/${id}`);
    return;
  }
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

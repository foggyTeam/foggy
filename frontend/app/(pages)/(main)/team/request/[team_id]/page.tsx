import React from 'react';
import { Team } from '@/app/lib/types/definitions';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import TeamRequest from '@/app/lib/components/teams/teamRequest';
import { GetShortTeamInfo } from '@/app/lib/server/actions/teamServerActions';
import { notFound, redirect } from 'next/navigation';

async function getTeamInfo(id: string): Promise<Team | undefined> {
  const team = await GetShortTeamInfo(id);
  if (!team.settings?.allowRequests) redirect(`/forbidden?type=team`);

  if (!team) notFound();

  return team;
}

export default async function TeamRequestPage({
  params,
}: Readonly<{
  params: Promise<{ team_id: string }>;
}>) {
  const { team_id } = await params;
  const teamData = await getTeamInfo(team_id);

  return (
    <div className="flex h-screen w-screen items-center justify-center px-24 py-8">
      <div
        className={clsx(
          'flex h-fit min-h-56 w-full max-w-xl items-center justify-center',
          bg_container_no_padding,
          'rounded-br-[64px] p-8',
        )}
      >
        <TeamRequest team={teamData} />
      </div>
    </div>
  );
}

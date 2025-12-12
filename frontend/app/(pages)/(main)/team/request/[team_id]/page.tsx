import React from 'react';
import activeTeam from '@/app/mockData/team.json';
import { Team, TeamSettings } from '@/app/lib/types/definitions';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import TeamRequest from '@/app/lib/components/teams/teamRequest';

async function getTeamInfo(id: string): Promise<Team | undefined> {
  //TODO: uncomment when API ready
  //const project = await GetProject(id);
  //if (!team.settings.isPublic) redirect(`/forbidden?type=team`);

  //if (!project) notFound();

  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({ ...activeTeam, settings: { ...new TeamSettings() } } as any),
      300,
    ),
  );
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

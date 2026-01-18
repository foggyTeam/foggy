import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import React from 'react';
import AllTeamMembers from '@/app/lib/components/teams/allTeamMembers';
import AllTeamProjects from '@/app/lib/components/teams/allTeamProjects';
import AdaptiveContainer from '@/app/lib/components/adaptiveContainer';

export default async function TeamPage() {
  return (
    <AdaptiveContainer
      desktopContainerClassName="flex h-full w-full flex-col items-center justify-center gap-8 p-4 px-24 py-8"
      mobileTabs={[
        { key: 'team', titleKey: 'team' },
        { key: 'projects', titleKey: 'teamProjects' },
      ]}
    >
      <div
        key="team"
        className={clsx(
          'flex h-full min-h-56 w-full flex-col items-center justify-center',
          bg_container_no_padding,
          'px-4 pt-4 sm:rounded-bl-[64px] sm:px-8 sm:pt-8',
        )}
      >
        <AllTeamMembers />
      </div>
      <div
        key="projects"
        className={clsx(
          'flex h-full min-h-52 w-full flex-col items-center justify-center sm:max-h-72',
          bg_container_no_padding,
          'px-4 pt-4 sm:rounded-tr-[64px] sm:px-8 sm:pt-8',
        )}
      >
        <AllTeamProjects />
      </div>
    </AdaptiveContainer>
  );
}

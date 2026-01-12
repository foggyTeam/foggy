import React from 'react';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import clsx from 'clsx';
import AllProjects from '@/app/lib/components/projects/allProjects';
import AllTeams from '@/app/lib/components/teams/allTeams';
import AdaptiveContainer from '@/app/lib/components/adaptiveContainer';

export default async function MainPage() {
  return (
    <AdaptiveContainer
      desktopContainerClassName="flex h-full max-h-screen w-full flex-col items-center justify-center gap-8 px-24 py-8"
      mobileTabs={[
        { key: 'allProjects', titleKey: 'myProjects' },
        { key: 'allTeams', titleKey: 'myTeams' },
      ]}
    >
      <div
        key="allProjects"
        className={clsx(
          'flex h-full w-full flex-col items-center justify-center',
          'sm:min-h-56 sm:rounded-bl-[64px] sm:px-8 sm:pt-8',
          'px-4 pt-4',
          bg_container_no_padding,
        )}
      >
        <AllProjects />
      </div>
      <div
        key="allTeams"
        className={clsx(
          'flex h-full w-full flex-col items-center justify-center',
          'sm:max-h-72 sm:min-h-52 sm:rounded-tr-[64px] sm:px-8 sm:pt-8',
          'px-4 pt-4',
          bg_container_no_padding,
        )}
      >
        <AllTeams />
      </div>
    </AdaptiveContainer>
  );
}

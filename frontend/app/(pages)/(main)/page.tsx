import React from 'react';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import clsx from 'clsx';
import AllProjects from '@/app/lib/components/projects/allProjects';
import AllTeams from '@/app/lib/components/teams/allTeams';

export default async function MainPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-8 px-24 py-8">
      <div
        className={clsx(
          'flex h-full min-h-56 w-full flex-col items-center justify-center',
          bg_container_no_padding,
          'rounded-bl-[64px] px-8 pt-8',
        )}
      >
        <AllProjects />
      </div>
      <div
        className={clsx(
          'flex h-full max-h-72 min-h-52 w-full flex-col items-center justify-center',
          bg_container_no_padding,
          'rounded-tr-[64px] px-8 pt-8',
        )}
      >
        <AllTeams />
      </div>
    </div>
  );
}

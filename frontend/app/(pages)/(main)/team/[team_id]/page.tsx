import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import React from 'react';
import AllTeamMembers from '@/app/lib/components/teams/allTeamMembers';
import AllTeamProjects from '@/app/lib/components/teams/allTeamProjects';

export default async function TeamPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-8 px-24 py-8">
      <div
        className={clsx(
          'flex h-full min-h-56 w-full flex-col items-center justify-center',
          bg_container_no_padding,
          'rounded-bl-[64px] px-8 pt-8',
        )}
      >
        <AllTeamMembers />
      </div>
      <div
        className={clsx(
          'flex h-full max-h-72 min-h-52 w-full flex-col items-center justify-center',
          bg_container_no_padding,
          'rounded-tr-[64px] px-8 pt-8',
        )}
      >
        <AllTeamProjects />
      </div>
    </div>
  );
}

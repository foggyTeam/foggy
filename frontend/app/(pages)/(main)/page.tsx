import React from 'react';

import ProjectsLoader from '@/app/lib/components/dataLoaders/projectsLoader';
import { Project, Team } from '@/app/lib/types/definitions';
import { cookies } from 'next/headers';
import { decrypt } from '@/app/lib/session';
import { signOut } from '@/auth';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import clsx from 'clsx';
import AllProjects from '@/app/lib/components/projects/allProjects';
import AllTeams from '@/app/lib/components/teams/allTeams';
import TeamsLoader from '@/app/lib/components/dataLoaders/teamsLoader';
import allProjects from '@/app/mockData/projects.json';
import allTeams from '@/app/mockData/teams.json';

async function getUserProjects(): Promise<Project[] | undefined> {
  const cookie = (await cookies()).get('session' as any)?.value;
  const session = await decrypt(cookie);

  if (!session) {
    return undefined;
  }

  try {
    return new Promise((resolve) => {
      setTimeout(() => resolve(allProjects), 300);
    });
  } catch (e) {
    console.error('User with this id does not exist.');
    await signOut();
    return undefined;
  }
}
async function getUserTeams(): Promise<Team[] | undefined> {
  const cookie = (await cookies()).get('session' as any)?.value;
  const session = await decrypt(cookie);

  if (!session) {
    return undefined;
  }

  try {
    return new Promise((resolve) => {
      setTimeout(() => resolve(allTeams), 300);
    });
  } catch (e) {
    console.error('User with this id does not exist.');
    await signOut();
    return undefined;
  }
}

export default async function MainPage() {
  const userProjects = await getUserProjects();
  const userTeams = await getUserTeams();

  return (
    <>
      <ProjectsLoader projectsData={userProjects} />
      <TeamsLoader teamsData={userTeams} />
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-8 px-24 py-8">
        <div
          className={clsx(
            'flex h-full min-h-56 w-full flex-col items-center justify-center',
            bg_container_no_padding,
            'rounded-bl-[64px] px-8 pt-8',
          )}
        >
          {userProjects?.length !== undefined ? (
            <AllProjects />
          ) : (
            <p> Loading </p>
          )}
        </div>
        <div
          className={clsx(
            'flex h-full max-h-72 min-h-52 w-full flex-col items-center justify-center',
            bg_container_no_padding,
            'rounded-tr-[64px] px-8 pt-8',
          )}
        >
          {userTeams?.length !== undefined ? <AllTeams /> : <p> Loading </p>}
        </div>
      </div>
    </>
  );
}

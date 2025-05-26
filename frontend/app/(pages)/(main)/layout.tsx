import React from 'react';
import RightSideBar from '@/app/lib/components/menu/rightSideBar/rightSideBar';
import { User } from 'next-auth';
import { getRequest } from '@/app/lib/server/requests';
import { cookies } from 'next/headers';
import UserLoader from '@/app/lib/components/dataLoaders/userLoader';
import { decrypt } from '@/app/lib/session';
import { signOut } from '@/auth';
import ProjectsLoader from '@/app/lib/components/dataLoaders/projectsLoader';
import TeamsLoader from '@/app/lib/components/dataLoaders/teamsLoader';
import { Project, Team } from '@/app/lib/types/definitions';
import allTeams from '@/app/mockData/teams.json';
import LeftSideBar from '@/app/lib/components/menu/leftSideBar/leftSideBar';
import getUserId from '@/app/lib/getUserId';

async function getUser() {
  const cookie = (await cookies()).get('session' as any)?.value;
  const session = await decrypt(cookie);

  if (!session) {
    return undefined;
  }

  try {
    const userData: any = await getRequest(`users/${session.userId}`);

    return {
      id: userData['_id'],
      name: userData.nickname,
      email: userData.email,
      image: userData.avatar,
    } as User;
  } catch (e) {
    console.error('User with this id does not exist.');
    await signOut();
    return undefined;
  }
}

async function getUserProjects(): Promise<Project[] | undefined> {
  try {
    return await getRequest('projects', {
      headers: {
        'x-user-id': await getUserId(),
      },
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
      setTimeout(() => resolve(allTeams as Team[]), 300);
    });
  } catch (e) {
    console.error('User with this id does not exist.');
    await signOut();
    return undefined;
  }
}

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user: User | undefined = await getUser();
  const userProjects = await getUserProjects();
  const userTeams = await getUserTeams();

  return (
    <>
      <UserLoader userData={user} />
      <ProjectsLoader projectsData={userProjects} />
      <TeamsLoader teamsData={userTeams} />
      <LeftSideBar />
      <RightSideBar />
      {children}
    </>
  );
}

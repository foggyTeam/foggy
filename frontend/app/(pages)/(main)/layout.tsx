import React from 'react';
import RightSideBar from '@/app/lib/components/menu/rightSideBar/rightSideBar';
import { User } from 'next-auth';
import UserLoader from '@/app/lib/components/dataLoaders/userLoader';
import ProjectsLoader from '@/app/lib/components/dataLoaders/projectsLoader';
import TeamsLoader from '@/app/lib/components/dataLoaders/teamsLoader';
import { Project, Team } from '@/app/lib/types/definitions';
import allTeams from '@/app/mockData/teams.json';
import LeftSideBar from '@/app/lib/components/menu/leftSideBar/leftSideBar';
import { GetAllProjects } from '@/app/lib/server/actions/projectServerActions';
import { GetUserById } from '@/app/lib/server/actions/userServerActions';

async function getUser() {
  try {
    const userData = await GetUserById();

    return {
      id: userData['_id'],
      name: userData.nickname,
      email: userData.email,
      image: userData.avatar,
    } as User;
  } catch (e) {
    console.error('User with this id does not exist.');
    return undefined;
  }
}

async function getUserProjects(): Promise<Project[] | undefined> {
  try {
    return await GetAllProjects();
  } catch (e) {
    console.error('User with this id does not exist.');
    return undefined;
  }
}
async function getUserTeams(): Promise<Team[] | undefined> {
  try {
    return new Promise((resolve) => {
      setTimeout(() => resolve(allTeams as Team[]), 300);
    });
  } catch (e) {
    console.error('User with this id does not exist.');
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

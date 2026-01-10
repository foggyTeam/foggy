import React from 'react';
import RightSideBar from '@/app/lib/components/menu/rightSideBar/rightSideBar';
import UserLoader from '@/app/lib/components/dataLoaders/userLoader';
import ProjectsLoader from '@/app/lib/components/dataLoaders/projectsLoader';
import TeamsLoader from '@/app/lib/components/dataLoaders/teamsLoader';
import { Project, Team } from '@/app/lib/types/definitions';
import LeftSideBar from '@/app/lib/components/menu/leftSideBar/leftSideBar';
import { GetAllProjects } from '@/app/lib/server/actions/projectServerActions';
import { GetUserById } from '@/app/lib/server/actions/userServerActions';
import NotificationsLoader from '@/app/lib/components/dataLoaders/notificationsLoader';
import { User } from 'next-auth';
import BoardLoadingCard from '@/app/lib/components/boardLoadingCard';
import { GetAllTeams } from '@/app/lib/server/actions/teamServerActions';
import NavBar from '@/app/lib/components/menu/mobileNavBar/navBar';

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
    return await GetAllTeams();
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
      <NotificationsLoader />
      <BoardLoadingCard />

      <section className="hidden sm:block">
        <LeftSideBar />
        <RightSideBar />
      </section>

      <section className="block sm:hidden">
        <NavBar />
      </section>

      {children}
    </>
  );
}

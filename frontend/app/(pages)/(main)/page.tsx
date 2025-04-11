import React from 'react';
import ProjectsLoader from '@/app/lib/components/dataLoaders/projectsLoader';
import {
  Project,
  ProjectMember,
  Team,
  TeamMember,
} from '@/app/lib/types/definitions';
import { cookies } from 'next/headers';
import { decrypt } from '@/app/lib/session';
import { signOut } from '@/auth';
import { bg_container } from '@/app/lib/types/styles';
import clsx from 'clsx';
import AllProjects from '@/app/lib/components/projects/allProjects';
import AllTeams from '@/app/lib/components/teams/allTeams';

const testMembers = [
  {
    id: '79b52f71aa364a43b1fd4a512ff1b90a',
    nickname: 'MintCanella',
    avatar: 'http://postimg.su/image/adq7HUIB/s15.png',
    role: 'editor',
  },
  {
    id: '4033e9c775af4a9aa694e62670755f91',
    nickname: 'PWGoood',
    avatar: 'http://postimg.su/image/Qe7bRQeD/b3.png',
    role: 'reader',
  },
  {
    id: '416b47a6f3e54e188fb4eb9d2e89e9d2',
    nickname: 'FakeMintCanella',
    avatar: 'http://postimg.su/image/adq7HUIB/s15.png',
    role: 'editor',
  },
  {
    id: 'e5a7e0254ca1472c8850a27b0a103c28',
    nickname: 'HoggyFoggy231',
    avatar: 'http://postimg.su/image/jS9F0TS1/b4.png',
    role: 'admin',
  },
  {
    id: 'e300f4326cb641598c59e025afe1b361',
    nickname: 'ChillGuy',
    avatar: 'http://postimg.su/image/Qe7bRQeD/b3.png',
    role: 'reader',
  },
  {
    id: '40bdae8902f74ef09c3ab245aaf7e74e',
    nickname: 'Someone',
    avatar: 'http://postimg.su/image/adq7HUIB/s15.png',
    role: 'editor',
  },
  {
    id: 'afc9e590326c456f937413eba939b08b',
    nickname: 'IEatKids',
    avatar: 'http://postimg.su/image/jS9F0TS1/b4.png',
    role: 'editor',
  },
];
const testProjects = [
  {
    id: 'project1',
    name: 'My first project',
    avatar: 'http://postimg.su/image/mza7RguS/b4.png',
    description:
      'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam' +
      ' nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam' +
      ' erat, sed diam voluptua. At vero eos et accusam et justo duo' +
      ' dolores et ea rebum. Stet clita kasd gubergren, no sea takimata' +
      ' sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,' +
      ' consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt' +
      ' ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero' +
      ' eos et accusam et justo duo dolores et ea rebum. Stet clita kasd' +
      ' gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
    favourite: false,
    members: testMembers.slice(2, 5) as ProjectMember[],
    boards: [],
    lastChange: Date.now(),
  },
  {
    id: 'project2',
    name: 'My second project',
    avatar: '',
    description:
      'Lorem ipsum dolor sit amet, consetetur sadipscing elitr,' +
      ' sed diam nonumy eirmod tempor invidunt ut labore et dolore magna' +
      ' aliquyam erat, sed diam voluptua. At vero eos et accusam et justo' +
      ' duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata' +
      ' sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,',
    favourite: true,
    members: testMembers as ProjectMember[],
    boards: [],
    lastChange: Date.now(),
  },
  {
    id: 'project3',
    name: 'THIRDY',
    avatar: 'http://postimg.su/image/HS94hp0y/b8.png',
    description:
      'Lorem ipsum dolor sit amet, consetetur sadipscing elitr,' +
      ' sed diam nonumy eirmod tempor invidunt ut labore et dolore magna' +
      ' aliquyam erat, sed diam voluptua. At vero eos et accusam et justo' +
      ' duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata' +
      ' sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,',
    favourite: true,
    members: testMembers.slice(0, 3) as ProjectMember[],
    boards: [],
    lastChange: Date.now(),
  },
] as Project[];
const testTeams = [
  {
    id: 'team1',
    name: 'the best team',
    avatar: 'http://postimg.su/image/mza7RguS/b4.png',
    members: testMembers as TeamMember[],
  },
  {
    id: 'team2',
    name: 'besties',
    avatar: 'http://postimg.su/image/HS94hp0y/b8.png',
    members: testMembers.slice(2, 5) as TeamMember[],
  },
  {
    id: 'team3',
    name: 'FoggyTeam',
    avatar: 'http://postimg.su/image/HS94hp0y/b8.png',
    members: testMembers.slice(1, 3) as TeamMember[],
  },
  {
    id: 'team4',
    name: 'FOGGY TEAM',
    avatar: 'http://postimg.su/image/adq7HUIB/s15.pngng',
    members: testMembers.slice(3, 5) as TeamMember[],
  },
] as Team[];

async function getUserProjects() {
  const cookie = (await cookies()).get('session' as any)?.value;
  const session = await decrypt(cookie);

  if (!session) {
    return undefined;
  }

  try {
    const userProjects: any = testProjects.map((project) => {
      return {
        ...project,
        members: [...project.members, { id: session.userId, role: 'owner' }],
      };
    });

    return userProjects as Project[];
  } catch (e) {
    console.error('User with this id does not exist.');
    await signOut();
    return undefined;
  }
}

async function getUserTeams() {
  const cookie = (await cookies()).get('session' as any)?.value;
  const session = await decrypt(cookie);

  if (!session) {
    return undefined;
  }

  try {
    const userTeams: any = testTeams.map((team) => {
      return {
        ...team,
        members: [...team.members, { id: session.userId, role: 'owner' }],
      };
    });

    return userTeams as Team[];
  } catch (e) {
    console.error('User with this id does not exist.');
    await signOut();
    return undefined;
  }
}

export default async function Main() {
  const userProjects = await getUserProjects();
  const userTeams = await getUserTeams();

  return (
    <>
      <ProjectsLoader projectsData={userProjects} />
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-8 px-24 py-8">
        <div
          className={clsx(
            'flex h-full min-h-0.5 w-full flex-col items-center justify-center',
            bg_container,
            'rounded-bl-[64px] px-12',
          )}
        >
          {userProjects?.length !== undefined ? (
            <AllProjects projects={userProjects} />
          ) : (
            <p> Loading </p>
          )}
        </div>
        <div
          className={clsx(
            'flex h-96 w-full flex-col items-center justify-center',
            bg_container,
            'rounded-tr-[64px] px-12',
          )}
        >
          {userTeams?.length !== undefined ? (
            <AllTeams teams={userTeams} />
          ) : (
            <p> Loading </p>
          )}
        </div>
      </div>
    </>
  );
}

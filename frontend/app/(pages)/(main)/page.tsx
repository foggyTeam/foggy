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
import { bg_container_no_padding } from '@/app/lib/types/styles';
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
    avatar:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&h=200&fit=crop',
    description:
      'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam' +
      ' nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam' +
      ' erat, sed diam voluptua. At vero eos et accusam et justo duo' +
      ' dolores et ea rebum. Stet clita kasd gubergren, no sea takimata' +
      ' sanctus est Lorem ipsum dolor sit amet.',
    favorite: false,
    members: testMembers as ProjectMember[],
    boards: [],
    lastChange: new Date().toISOString(),
  },
  {
    id: 'project2',
    name: 'My second project',
    avatar:
      'https://images.unsplash.com/photo-1502767089025-6572583495b9?w=200&h=200&fit=crop',
    description:
      'Lorem ipsum dolor sit amet, consetetur sadipscing elitr,' +
      ' sed diam nonumy eirmod tempor invidunt ut labore et dolore magna' +
      ' aliquyam erat, sed diam voluptua. At vero eos et accusam et justo' +
      ' duo dolores et ea rebum.',
    favorite: true,
    members: testMembers.slice(2, 5) as ProjectMember[],
    boards: [],
    lastChange: new Date().toISOString(),
  },
  {
    id: 'project3',
    name: 'THIRDY',
    avatar:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=200&fit=crop',
    description:
      'Lorem ipsum dolor sit amet, consetetur sadipscing elitr,' +
      ' sed diam nonumy eirmod tempor invidunt ut labore et dolore magna' +
      ' aliquyam erat, sed diam voluptua. At vero eos et accusam et justo' +
      ' duo dolores et ea rebum.',
    favorite: true,
    members: testMembers.slice(0, 3) as ProjectMember[],
    boards: [],
    lastChange: new Date().toISOString(),
  },
  {
    id: 'project4',
    name: 'Project Alpha',
    avatar:
      'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=200&h=200&fit=crop',
    description:
      'Focused on innovation and delivering groundbreaking solutions.' +
      ' Join us as we revolutionize technology.',
    favorite: false,
    members: testMembers.slice(1, 4) as ProjectMember[],
    boards: [],
    lastChange: new Date().toISOString(),
  },
  {
    id: 'project5',
    name: 'Beta Project',
    avatar:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=200&fit=crop',
    description:
      'Exploring the depths of AI and machine learning. Collaborate' +
      ' with experts to unlock new potentials.',
    favorite: true,
    members: testMembers as ProjectMember[],
    boards: [],
    lastChange: new Date().toISOString(),
  },
  {
    id: 'project6',
    name: 'Gamma Initiatives',
    avatar:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=200&h=200&fit=crop',
    description:
      'Dedicated to environmental sustainability and green technology.' +
      ' Together, we can make a difference.',
    favorite: false,
    members: testMembers.slice(3, 6) as ProjectMember[],
    boards: [],
    lastChange: new Date().toISOString(),
  },
  {
    id: 'project7',
    name: 'Delta Operations',
    avatar:
      'https://images.unsplash.com/photo-1492724441997-5dc865305da8?w=200&h=200&fit=crop',
    description:
      'Optimizing logistics and operations for businesses worldwide.' +
      ' Efficiency is our mission.',
    favorite: true,
    members: testMembers.slice(0, 2) as ProjectMember[],
    boards: [],
    lastChange: new Date().toISOString(),
  },
  {
    id: 'project8',
    name: 'Epsilon Research',
    avatar:
      'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=200&h=200&fit=crop',
    description:
      'Pioneering advancements in biomedical research. Join us in' +
      ' shaping the future of healthcare.',
    favorite: false,
    members: testMembers.slice(2, 5) as ProjectMember[],
    boards: [],
    lastChange: new Date().toISOString(),
  },
  {
    id: 'project9',
    name: 'Zeta Solutions',
    avatar:
      'https://images.unsplash.com/photo-1512446733611-9099a758e357?w=200&h=200&fit=crop',
    description:
      'Delivering customized IT solutions for businesses of all sizes.' +
      ' Your success is our priority.',
    favorite: true,
    members: testMembers.slice(1, 3) as ProjectMember[],
    boards: [],
    lastChange: new Date().toISOString(),
  },
  {
    id: 'project10',
    name: 'Theta Enterprises',
    avatar:
      'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=200&h=200&fit=crop',
    description:
      'Combining creativity and technology to craft unique experiences.' +
      ' Innovation starts here.',
    favorite: false,
    members: testMembers.slice(0, 2) as ProjectMember[],
    boards: [],
    lastChange: new Date().toISOString(),
  },
  {
    id: 'project11',
    name: 'Iota Labs',
    avatar:
      'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=200&h=200&fit=crop',
    description:
      'Driving discovery through cutting-edge scientific research.' +
      ' Explore the unknown with us.',
    favorite: false,
    members: testMembers.slice(1, 4) as ProjectMember[],
    boards: [],
    lastChange: new Date().toISOString(),
  },
  {
    id: 'project12',
    name: 'Kappa Ventures',
    avatar:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&h=200&fit=crop',
    description:
      'Empowering startups and entrepreneurs with guidance and funding.' +
      ' Build your dream with us.',
    favorite: true,
    members: testMembers as ProjectMember[],
    boards: [],
    lastChange: new Date().toISOString(),
  },
  {
    id: 'project13',
    name: 'Lambda Creations',
    avatar:
      'https://images.unsplash.com/photo-1502378735452-bc7d86632805?w=200&h=200&fit=crop',
    description:
      'Designing the future with innovative fashion and style. Be bold,' +
      ' be unique.',
    favorite: false,
    members: testMembers.slice(3, 6) as ProjectMember[],
    boards: [],
    lastChange: new Date().toISOString(),
  },
  {
    id: 'project14',
    name: 'Mu Dynamics',
    avatar:
      'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=200&h=200&fit=crop',
    description:
      'Advancing robotics and automation to transform industries.' +
      ' Efficiency reimagined.',
    favorite: true,
    members: testMembers.slice(0, 2) as ProjectMember[],
    boards: [],
    lastChange: new Date().toISOString(),
  },
  {
    id: 'project15',
    name: 'Nu Horizons',
    avatar:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=200&fit=crop',
    description:
      'Exploring the cosmos and beyond. Join us on our journey to the stars.',
    favorite: false,
    members: testMembers.slice(2, 5) as ProjectMember[],
    boards: [],
    lastChange: new Date().toISOString(),
  },
  {
    id: 'project16',
    name: 'Omicron Synergy',
    avatar:
      'https://images.unsplash.com/photo-1502767089025-6572583495b9?w=200&h=200&fit=crop',
    description:
      'Fostering collaboration across industries to drive innovation.' +
      ' Together, we achieve more.',
    favorite: true,
    members: testMembers.slice(1, 3) as ProjectMember[],
    boards: [],
    lastChange: new Date().toISOString(),
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
            'flex h-96 w-full flex-col items-center justify-center',
            bg_container_no_padding,
            'rounded-tr-[64px] px-8 pt-8',
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

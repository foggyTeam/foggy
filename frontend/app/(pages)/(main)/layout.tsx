import React from 'react';
import LogoBar from '@/app/lib/components/menu/logoBar';
import SideBar from '@/app/lib/components/menu/sideBar/sideBar';
import { User } from 'next-auth';
import { getRequest } from '@/app/lib/server/requests';
import { cookies } from 'next/headers';
import UserLoader from '@/app/lib/components/dataLoaders/userLoader';
import { decrypt } from '@/app/lib/session';
import { signOut } from '@/auth';

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

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user: User | undefined = await getUser();

  return (
    <>
      <UserLoader userData={user} />
      <LogoBar />
      <SideBar />
      {children}
    </>
  );
}

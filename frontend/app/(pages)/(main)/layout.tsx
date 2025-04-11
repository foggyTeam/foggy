import React from 'react';
import LogoBar from '@/app/lib/components/menu/logoBar';
import SideBar from '@/app/lib/components/menu/sideBar/sideBar';
import { User } from 'next-auth';
import { getRequest } from '@/app/lib/server/requests';
import { cookies } from 'next/headers';
import UserLoader from '@/app/lib/components/userLoader';
import { decrypt } from '@/app/lib/session';

async function getUser() {
  const cookie = (await cookies()).get('session' as any)?.value;
  const session = await decrypt(cookie);

  if (!session) {
    return null;
  }

  const userData = await getRequest('users/' + session.userId);
  return userData
    ? ({
        id: userData['_id'],
        name: userData.nickname,
        email: userData.email,
        image: userData.avatar ? userData.avatar : '/images/img.png',
      } as User)
    : null;
}

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user: User | null = await getUser();

  return (
    <>
      <UserLoader userData={user} />
      <LogoBar />
      <SideBar />
      {children}
    </>
  );
}

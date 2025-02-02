import React from 'react';
import LogoBar from '@/app/lib/components/menu/logoBar';
import SideBar from '@/app/lib/components/menu/sideBar';
import UserLoader from '@/app/lib/components/utils/userLoader';

export default function MainLayout({ children }) {
  return (
    <>
      <LogoBar />
      <SideBar />
      {children}
      <UserLoader />
    </>
  );
}

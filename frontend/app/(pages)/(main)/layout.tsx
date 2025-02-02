import React from 'react';
import LogoBar from '@/app/lib/components/menu/logoBar';
import SideBar from '@/app/lib/components/menu/sideBar';

export default function MainLayout({ children }) {
  return (
    <>
      <LogoBar />
      <SideBar />
      {children}
    </>
  );
}

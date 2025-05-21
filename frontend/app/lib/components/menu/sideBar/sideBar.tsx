'use client';

import ClosedSideBar from '@/app/lib/components/menu/sideBar/closedSideBar';
import OpenedSideBar from '@/app/lib/components/menu/sideBar/openedSideBar';
import { useState } from 'react';

export default function SideBar() {
  const [isOpened, setIsOpened] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'projects' | 'teams' | 'notifications'
  >('projects');

  return (
    <>
      {!isOpened && (
        <ClosedSideBar
          openSideBar={() => setIsOpened(true)}
          setActiveTab={setActiveTab}
        />
      )}
      <OpenedSideBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpened={isOpened}
        closeSideBar={() => setIsOpened(false)}
      />
    </>
  );
}

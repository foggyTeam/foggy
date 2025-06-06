'use client';

import ClosedRightSideBar from '@/app/lib/components/menu/rightSideBar/closedRightSideBar';
import OpenedRightSideBar from '@/app/lib/components/menu/rightSideBar/openedRightSideBar';
import { useState } from 'react';

export default function RightSideBar() {
  const [isOpened, setIsOpened] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'projects' | 'teams' | 'notifications'
  >('projects');

  return (
    <>
      {!isOpened && (
        <ClosedRightSideBar
          openSideBar={() => setIsOpened(true)}
          setActiveTab={setActiveTab}
        />
      )}
      <OpenedRightSideBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpened={isOpened}
        closeSideBar={() => setIsOpened(false)}
      />
    </>
  );
}

'use client';

import ClosedRightSideBar from '@/app/lib/components/menu/rightSideBar/closedRightSideBar';
import OpenedRightSideBar from '@/app/lib/components/menu/rightSideBar/openedRightSideBar';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function RightSideBar() {
  const path = usePathname();

  const [isOpened, setIsOpened] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'projects' | 'teams' | 'notifications'
  >('projects');

  useEffect(() => {
    setIsOpened(false);
  }, [path]);

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

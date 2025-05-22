'use client';

import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import LogoBar from '@/app/lib/components/menu/leftSideBar/logoBar';
import RecentBar from '@/app/lib/components/menu/leftSideBar/recentBar';
import { usePathname } from 'next/navigation';
import projectsStore from '@/app/stores/projectsStore';
import OpenedLeftSideBar from '@/app/lib/components/menu/leftSideBar/openedLeftSideBar';

const LeftSideBar = observer(() => {
  const pathRegex = new RegExp(
    `^/project/[^/]+/[^/]+/${projectsStore.activeBoard?.id}$`,
  );

  const [isOpened, setIsOpened] = useState(false);
  const path = usePathname();

  useEffect(() => {
    if (!pathRegex.test(path)) setIsOpened(false);
  }, [path]);

  return (
    <>
      {!isOpened && <LogoBar />}
      {pathRegex.test(path) &&
        (isOpened ? (
          <OpenedLeftSideBar
            isOpened={isOpened}
            closeSideBar={() => setIsOpened(false)}
          />
        ) : (
          <RecentBar openSideBar={() => setIsOpened(true)} />
        ))}
    </>
  );
});

export default LeftSideBar;

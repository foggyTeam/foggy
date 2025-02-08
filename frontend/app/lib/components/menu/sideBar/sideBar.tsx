'use client';

import ClosedSideBar from '@/app/lib/components/menu/sideBar/closedSideBar';
import OpenedSideBar from '@/app/lib/components/menu/sideBar/openedSideBar';
import menuStore from '@/app/stores/menuStore';
import { observer } from 'mobx-react-lite';

const SideBar = observer(() => {
  const sideBarLayout: string =
    'absolute right-0 top-8 z-50 rounded-r-none ' +
    'rounded-bl-[64px] rounded-tl-2xl px-1 py-12 overflow-visible';

  return (
    <>
      {!menuStore.isOpen && <ClosedSideBar sideBarLayout={sideBarLayout} />}
      {menuStore.isOpen && <OpenedSideBar sideBarLayout={sideBarLayout} />}
    </>
  );
});

export default SideBar;

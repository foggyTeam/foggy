'use client';

import clsx from 'clsx';
import { bg_container, sh_container } from '@/app/lib/utils/style_definitions';
import ClosedSideBar from '@/app/lib/components/menu/sideBar/closedSideBar';
import OpenedSideBar from '@/app/lib/components/menu/sideBar/openedSideBar';
import menuStore from '@/app/stores/menuStore';
import { observer } from 'mobx-react-lite';

const SideBar = observer(() => {
  return (
    <div
      className={clsx(
        'absolute right-0 top-8 z-50 flex flex-col items-center justify-center rounded-r-none rounded-bl-[64px] rounded-tl-2xl px-1 py-12',
        bg_container,
        sh_container,
      )}
    >
      {!menuStore.isOpen && <ClosedSideBar />}

      <OpenedSideBar />
    </div>
  );
});

export default SideBar;

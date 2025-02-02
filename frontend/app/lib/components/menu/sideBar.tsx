'use client';

import ClosedSideBar from '@/app/lib/components/menu/sideBar/closedSideBar';
import OpenedSideBar from '@/app/lib/components/menu/sideBar/openedSideBar';
import menuStore from '@/app/stores/menuStore';
import { observer } from 'mobx-react-lite';
import { Button } from '@heroui/button';
import { ChevronLeft } from 'lucide-react';

const SideBar = observer(() => {
  const sideBarLayout: string =
    'absolute right-0 top-8 z-50 flex flex-col items-center justify-center gap-4 overflow-visible rounded-r-none rounded-bl-[64px] rounded-tl-2xl px-1 py-12';

  return (
    <>
      <Button
        onPress={menuStore.toggleRightMenu}
        isIconOnly
        variant="light"
        size="sm"
        radius="full"
        className="absolute right-16 top-8 z-50 mr-1"
      >
        <ChevronLeft className="stroke-default-400" />
      </Button>

      {!menuStore.isOpen && <ClosedSideBar sideBarLayout={sideBarLayout} />}

      <OpenedSideBar sideBarLayout={sideBarLayout} />
    </>
  );
});

export default SideBar;

'use client';

import clsx from 'clsx';
import { bg_container, sh_container } from '@/app/lib/utils/style_definitions';
import ClosedSideBar from '@/app/lib/components/menu/sideBar/closedSideBar';
import OpenedSideBar from '@/app/lib/components/menu/sideBar/openedSideBar';
import menuStore from '@/app/stores/menuStore';
import { observer } from 'mobx-react-lite';
import { Button } from '@heroui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SideBar = observer(() => {
  return (
    <>
      <div
        className={clsx(
          'absolute right-0 top-8 z-50 flex items-center justify-center overflow-visible rounded-r-none rounded-bl-[64px] rounded-tl-2xl px-1 py-12',
          bg_container,
          sh_container,
        )}
      >
        <Button
          onPress={menuStore.toggleRightMenu}
          isIconOnly
          variant="light"
          size="sm"
          radius="full"
          className="absolute -left-9 top-16"
        >
          <ChevronLeft className="stroke-default-400" />
        </Button>

        {!menuStore.isOpen && <ClosedSideBar />}

        <OpenedSideBar />
      </div>
    </>
  );
});

export default SideBar;

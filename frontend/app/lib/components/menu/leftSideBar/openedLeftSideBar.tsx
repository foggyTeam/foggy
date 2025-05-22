'use client';

import { observer } from 'mobx-react-lite';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
} from '@heroui/drawer';
import { bg_container, left_sidebar_layout } from '@/app/lib/types/styles';
import React from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import FoggyLarge from '@/app/lib/components/svg/foggyLarge';

const OpenedLeftSideBar = observer(
  ({
    isOpened,
    closeSideBar,
  }: {
    isOpened: boolean;
    closeSideBar: () => void;
  }) => {
    return (
      <Drawer
        isOpen={isOpened}
        onClick={closeSideBar}
        onClose={closeSideBar}
        placement="left"
        backdrop="transparent"
        hideCloseButton
        className={clsx(
          bg_container,
          left_sidebar_layout,
          'h-fit w-fit',
          'transform transition-all hover:bg-opacity-65 hover:pl-0.5',
        )}
      >
        <DrawerContent className="gap-4">
          <DrawerHeader className="flex items-center justify-center gap-4 py-0">
            <Link href="/">
              <FoggyLarge
                className="fill-primary stroke-primary stroke-0 transition-all duration-300 hover:fill-[url(#logo-gradient)] hover:stroke-2"
                height={48}
                width={116}
              />
            </Link>
          </DrawerHeader>
          <DrawerBody className="gap-2 py-0">body</DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  },
);

export default OpenedLeftSideBar;

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
import { BreadcrumbItem, Breadcrumbs } from '@heroui/breadcrumbs';
import { Button } from '@heroui/button';
import { SettingsIcon } from 'lucide-react';
import projectsStore from '@/app/stores/projectsStore';

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
          <DrawerBody className="gap-2 py-0">
            <div className="flex items-center justify-between gap-2">
              <Breadcrumbs
                className="w-64"
                itemClasses={{
                  separator: 'px-1',
                }}
                separator="/"
                maxItems={3}
                itemsBeforeCollapse={1}
                itemsAfterCollapse={1}
              >
                <BreadcrumbItem>
                  <p className="max-w-24 overflow-hidden text-ellipsis text-nowrap">
                    PROJECT FOGGY
                  </p>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <p className="max-w-24 overflow-hidden text-ellipsis text-nowrap">
                    SECTION
                  </p>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <p className="max-w-24 overflow-hidden text-ellipsis text-nowrap">
                    SECTION
                  </p>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <p className="max-w-24 overflow-hidden text-ellipsis text-nowrap">
                    FINAL SECTION
                  </p>
                </BreadcrumbItem>
              </Breadcrumbs>
              <Button
                as={Link}
                href={`/project/${projectsStore.activeProject?.id}`}
                isIconOnly
                variant="light"
                size="md"
              >
                <SettingsIcon className="stroke-default-500" />
              </Button>
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  },
);

export default OpenedLeftSideBar;

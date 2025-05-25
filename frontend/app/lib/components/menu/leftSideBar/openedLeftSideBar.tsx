'use client';

import { observer } from 'mobx-react-lite';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
} from '@heroui/drawer';
import { bg_container, left_sidebar_layout } from '@/app/lib/types/styles';
import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import FoggyLarge from '@/app/lib/components/svg/foggyLarge';
import { BreadcrumbItem, Breadcrumbs } from '@heroui/breadcrumbs';
import { Button } from '@heroui/button';
import { SettingsIcon } from 'lucide-react';
import projectsStore from '@/app/stores/projectsStore';
import { ProjectSection } from '@/app/lib/types/definitions';

const OpenedLeftSideBar = observer(
  ({
    isOpened,
    closeSideBar,
  }: {
    isOpened: boolean;
    closeSideBar: () => void;
  }) => {
    const [parentList, setParentList] = useState<string[]>(
      projectsStore.getProjectChildParentList(),
    );
    const activeSection = useMemo(
      () =>
        projectsStore.getProjectChild(
          parentList[parentList.length - 1],
          parentList,
        ) as ProjectSection,
      [parentList],
    );

    const handleOpenRoot = () => {
      setParentList([]);
    };
    const handleOpenParent = () => {
      console.log('Go to parent (parentList[-2])');
    };

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
                className="w-72 font-medium"
                itemClasses={{
                  separator: 'px-1',
                }}
                separator="/"
                maxItems={3}
                itemsBeforeCollapse={1}
                itemsAfterCollapse={1}
              >
                <BreadcrumbItem onPress={handleOpenRoot}>
                  <p className="w-full overflow-hidden text-ellipsis text-nowrap">
                    {(projectsStore.activeProject?.name || '').toUpperCase()}
                  </p>
                </BreadcrumbItem>
                {(parentList.length > 2
                  ? parentList.slice(parentList.length - 2)
                  : parentList
                ).map((sectionId) => (
                  <BreadcrumbItem key={sectionId} onPress={handleOpenParent}>
                    <p className="w-full overflow-hidden text-ellipsis text-nowrap">
                      {sectionId === activeSection.id ? activeSection.name : ''}
                    </p>
                  </BreadcrumbItem>
                ))}
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
            <div className="flex flex-col">
              {Array.from(activeSection.children.values()).map((child) => {
                return 'type' in child ? (
                  <p>{child.name}</p>
                ) : (
                  <p>{child.name}</p>
                );
              })}
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  },
);

export default OpenedLeftSideBar;

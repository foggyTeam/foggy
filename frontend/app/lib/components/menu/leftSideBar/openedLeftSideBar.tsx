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
import SideBarElementCard from '@/app/lib/components/menu/leftSideBar/sideBarElementCard';
import { Board, ProjectSection } from '@/app/lib/types/definitions';
import { useRouter } from 'next/navigation';
import AreYouSureModal from '@/app/lib/components/modals/areYouSureModal';
import settingsStore from '@/app/stores/settingsStore';
import { useDisclosure } from '@heroui/modal';

const OpenedLeftSideBar = observer(
  ({
    isOpened,
    closeSideBar,
  }: {
    isOpened: boolean;
    closeSideBar: () => void;
  }) => {
    const router = useRouter();
    const {
      isOpen: isDeleteChildOpen,
      onOpen: onDeleteChildOpen,
      onOpenChange: onDeleteChildOpenChange,
    } = useDisclosure();
    const [nodeToRemove, setNodeToRemove] = useState<{
      id: string;
      parentList: string[];
    } | null>(null);

    const [parentList, setParentList] = useState<string[]>(
      projectsStore.getProjectChildParentList(),
    );
    const activeSection = useMemo(
      () =>
        projectsStore.getProjectChild(
          parentList[parentList.length - 1],
          parentList,
        ),
      [parentList],
    );

    const handleOpenRoot = () => {
      setParentList([]);
    };
    const handleOpenParent = () => {
      if (!('id' in activeSection)) return;
      let newParentList: string[] = [];
      try {
        newParentList = projectsStore.getProjectChildParentList(
          activeSection.id,
        );
      } catch (e) {
        // TODO: get request for this section
        // put a new section into the project
        // receive a parent list for a node
      }
      setParentList(newParentList);
    };

    const handleChildClick = (child: ProjectSection | Board) => {
      if ('children' in child) setParentList((prev) => [...prev, child.id]);
      else
        router.push(
          `/project/${projectsStore.activeProject?.id}/${child.sectionId}/${child.id}`,
        );
    };

    const removeNode = (id: string) => {
      setNodeToRemove({ id: id, parentList: parentList });
      onDeleteChildOpen();
    };

    return (
      <>
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
                  classNames={{
                    list: 'w-72 flex flex-nowrap font-medium ',
                  }}
                  itemClasses={{
                    base: 'overflow-hidden',
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
                        {'id' in activeSection && sectionId === activeSection.id
                          ? activeSection.name
                          : ''}
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
                {Array.from(
                  'children' in activeSection
                    ? activeSection.children.values()
                    : activeSection.values(),
                ).map((child: ProjectSection | Board) => (
                  <SideBarElementCard
                    element={child}
                    isActive={child.id === projectsStore.activeBoard?.id}
                    key={child.id}
                    handleClick={() => handleChildClick(child)}
                    addNode={() => console.log('add node')}
                    removeNode={() => removeNode(child.id)}
                  />
                ))}
              </div>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
        {isDeleteChildOpen && (
          <AreYouSureModal
            isOpen={isDeleteChildOpen}
            onOpenChange={onDeleteChildOpenChange}
            action={() => {
              if (nodeToRemove) {
                if (nodeToRemove.id === projectsStore.activeBoard?.id)
                  router.push(`/project/${projectsStore.activeProject?.id}`);

                projectsStore.deleteProjectChild(
                  nodeToRemove.id,
                  nodeToRemove.parentList,
                );
              }
              setNodeToRemove(null);
              onDeleteChildOpenChange();
            }}
            header={settingsStore.t.projects.deleteProjectChild.modalHeader}
            sure={settingsStore.t.projects.deleteProjectChild.modalSure}
            dismiss={settingsStore.t.projects.deleteProjectChild.modalDismiss}
          />
        )}
      </>
    );
  },
);

export default OpenedLeftSideBar;

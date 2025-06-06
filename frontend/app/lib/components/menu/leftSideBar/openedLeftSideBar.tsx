'use client';

import { observer } from 'mobx-react-lite';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
} from '@heroui/drawer';
import { bg_container, left_sidebar_layout } from '@/app/lib/types/styles';
import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import FoggyLarge from '@/app/lib/components/svg/foggyLarge';
import { BreadcrumbItem, Breadcrumbs } from '@heroui/breadcrumbs';
import { Button } from '@heroui/button';
import { SettingsIcon } from 'lucide-react';
import projectsStore from '@/app/stores/projectsStore';
import LeftSideBarElementCard from '@/app/lib/components/menu/leftSideBar/leftSideBarElementCard';
import { Board, ProjectSection } from '@/app/lib/types/definitions';
import { useRouter } from 'next/navigation';
import AreYouSureModal from '@/app/lib/components/modals/areYouSureModal';
import settingsStore from '@/app/stores/settingsStore';
import { useDisclosure } from '@heroui/modal';
import {
  DeleteBoard,
  DeleteSection,
  GetSection,
} from '@/app/lib/server/actions/projectServerActions';
import { Spinner } from '@heroui/spinner';
import { addToast } from '@heroui/toast';

const OpenedLeftSideBar = observer(
  ({
    isOpened,
    closeSideBar,
    parentList,
    setParentList,
    onAddOpen,
  }: {
    isOpened: boolean;
    closeSideBar: () => void;
    parentList: string[];
    setParentList: (
      value: ((prevState: string[]) => string[]) | string[],
    ) => void;
    onAddOpen: (newParentId: string) => void;
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
      isSection: boolean;
    } | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const activeSection = useMemo(
      () =>
        projectsStore.getProjectChild(
          parentList[parentList.length - 1],
          parentList,
        ),
      [parentList, isLoading],
    );

    useEffect(() => {
      setParentList(projectsStore.getProjectChildParentList());
    }, []);

    useEffect(() => {
      if (!activeSection) return;
      if (
        'children' in activeSection &&
        projectsStore.activeProject &&
        (activeSection.childrenNumber < 0 ||
          activeSection.children.size < activeSection.childrenNumber)
      ) {
        setIsLoading(true);
        GetSection(projectsStore.activeProject.id, activeSection.id)
          .then((result) => {
            projectsStore.insertProjectChild(
              parentList.slice(0, parentList.length - 1),
              result,
            );
          })
          .catch((error: any) =>
            addToast({
              color: 'danger',
              severity: 'danger',
              title: settingsStore.t.toasts.globalError,
              description: error,
            }),
          )
          .finally(() => setIsLoading(false));
      }
    }, [activeSection, parentList]);

    const handleOpenRoot = () => {
      setParentList([]);
    };

    const handleOpenParent = async () => {
      if (
        !activeSection ||
        !('id' in activeSection) ||
        !projectsStore.activeProject
      )
        return;
      try {
        const newParentList = projectsStore.getProjectChildParentList(
          activeSection.id,
        );
        setParentList(newParentList);
      } catch (e) {
        if ('parentId' in activeSection && activeSection.parentId) {
          const parentId = activeSection.parentId;
          setIsLoading(true);
          try {
            const result = await GetSection(
              projectsStore.activeProject.id,
              parentId,
            );
            projectsStore.insertProjectChild(
              parentList.slice(0, parentList.length - 2), // путь до родителя родителя
              result,
            );
            const newParentList = projectsStore.getProjectChildParentList(
              activeSection.id,
            );
            setParentList(newParentList);
          } catch (error: any) {
            addToast({
              color: 'danger',
              severity: 'danger',
              title: settingsStore.t.toasts.globalError,
            });
          } finally {
            setIsLoading(false);
          }
        }
      }
    };

    const handleChildClick = (child: ProjectSection | Board) => {
      if ('children' in child) setParentList((prev) => [...prev, child.id]);
      else
        router.push(
          `/project/${projectsStore.activeProject?.id}/${child.sectionId}/${child.id}`,
        );
    };
    const removeNode = (id: string, isSection: boolean) => {
      setNodeToRemove({ id: id, parentList: parentList, isSection });
      onDeleteChildOpen();
    };
    const handleRemoveNode = async () => {
      if (!projectsStore.activeProject) return;
      if (nodeToRemove) {
        if (nodeToRemove.id === projectsStore.activeBoard?.id)
          router.push(`/project/${projectsStore.activeProject?.id}`);

        try {
          setIsLoading(true);
          if (nodeToRemove.isSection) {
            await DeleteSection(
              projectsStore.activeProject.id,
              nodeToRemove.id,
            );
          } else {
            await DeleteBoard(nodeToRemove.id);
            addToast({
              color: 'success',
              severity: 'success',
              title: settingsStore.t.toasts.board.deleteBoardSuccess,
            });
            projectsStore.deleteProjectChild(
              nodeToRemove.id,
              nodeToRemove.parentList,
            );
          }
        } catch (error: any) {
          addToast({
            color: 'danger',
            severity: 'danger',
            title: settingsStore.t.toasts.board.deleteBoardError,
            description: error,
          });
        }
        setIsLoading(false);
      }
      setNodeToRemove(null);
      onDeleteChildOpenChange();
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
            'h-fit w-fit overflow-clip',
            'transform transition-all hover:bg-opacity-65 hover:pl-0.5',
          )}
        >
          <DrawerContent className="gap-4">
            <DrawerHeader className="flex items-center justify-center gap-4 py-0">
              <Link href="/">
                <FoggyLarge
                  className="group fill-primary stroke-primary stroke-0 transition-all duration-300 group-hover:fill-[url(#logo-gradient)] group-hover:stroke-2"
                  height={48}
                  width={116}
                />
              </Link>
            </DrawerHeader>
            <DrawerBody className="max-h-64 gap-2 py-0">
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
                        {activeSection &&
                        'id' in activeSection &&
                        sectionId === activeSection.id
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
              <div
                className={clsx(
                  'relative h-full w-full flex-1 overflow-y-auto',
                  'scrollbar-thin scrollbar-track-white/20 scrollbar-thumb-default-300',
                  'scrollbar-track-rounded-full scrollbar-thumb-rounded-full',
                )}
              >
                <div className="flex flex-col pr-1">
                  {isLoading ? (
                    <Spinner className="w-full p-1" size="sm" />
                  ) : (
                    Array.from(
                      !activeSection
                        ? []
                        : 'children' in activeSection
                          ? activeSection.children.values()
                          : !('type' in activeSection)
                            ? activeSection.values()
                            : [],
                    ).map(
                      (
                        child:
                          | ProjectSection
                          | Pick<
                              Board,
                              | 'id'
                              | 'type'
                              | 'name'
                              | 'sectionId'
                              | 'lastChange'
                            >,
                      ) => {
                        if (
                          'parentId' in child &&
                          child.parentId &&
                          !parentList.length
                        )
                          return null;
                        return (
                          <LeftSideBarElementCard
                            element={child as Board}
                            isActive={
                              child.id === projectsStore.activeBoard?.id
                            }
                            key={child.id}
                            handleClick={() => handleChildClick(child as Board)}
                            addNode={() => onAddOpen(child.id)}
                            removeNode={() =>
                              removeNode(child.id, 'children' in child)
                            }
                          />
                        );
                      },
                    )
                  )}
                </div>
              </div>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
        {isDeleteChildOpen && (
          <AreYouSureModal
            isOpen={isDeleteChildOpen}
            onOpenChange={onDeleteChildOpenChange}
            action={handleRemoveNode}
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

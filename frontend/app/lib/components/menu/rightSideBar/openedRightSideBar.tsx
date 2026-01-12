'use client';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
} from '@heroui/drawer';
import { observer } from 'mobx-react-lite';
import { bg_container, right_sidebar_layout } from '@/app/lib/types/styles';
import clsx from 'clsx';
import { User2Icon, UserCog2Icon } from 'lucide-react';
import { Button } from '@heroui/button';
import userStore from '@/app/stores/userStore';
import { Avatar } from '@heroui/avatar';
import { useRouter } from 'next/navigation';
import React, { Dispatch, SetStateAction } from 'react';
import OpenedRightSideBarContent from '@/app/lib/components/menu/rightSideBar/openedRightSideBarContent';

const OpenedRightSideBar = observer(
  ({
    activeTab,
    setActiveTab,
    isOpened,
    closeSideBar,
  }: {
    activeTab: 'projects' | 'teams' | 'notifications';
    setActiveTab: Dispatch<SetStateAction<any>>;
    isOpened: boolean;
    closeSideBar: () => void;
  }) => {
    const router = useRouter();

    return (
      <Drawer
        isOpen={isOpened}
        onClick={closeSideBar}
        onClose={closeSideBar}
        placement="right"
        backdrop="transparent"
        hideCloseButton
        className={clsx(
          bg_container,
          right_sidebar_layout,
          'h-fit w-fit',
          'transform overflow-clip transition-all hover:bg-[hsl(var(--heroui-background))]/65 hover:pr-0.5',
        )}
      >
        <DrawerContent className="gap-4">
          <DrawerHeader className="flex items-center justify-between gap-4 py-0">
            <div className="flex items-center justify-between gap-4">
              <Button
                onPress={() => {
                  router.push('/profile');
                }}
                className="h-fit w-fit min-w-fit rounded-full border-none p-0"
                variant="bordered"
              >
                <Avatar
                  showFallback
                  icon={<User2Icon className="stroke-default-200 h-64 w-64" />}
                  name={userStore.user?.name || undefined}
                  src={userStore.user?.image || undefined}
                  size="lg"
                  color="default"
                />
              </Button>
              <p className="text-small text-default-800 font-medium">
                {userStore.user?.name || ''}
              </p>
            </div>

            <Button
              onPress={() => {
                router.push('/profile');
              }}
              isIconOnly
              variant="light"
              size="md"
            >
              <UserCog2Icon className="stroke-default-600" />
            </Button>
          </DrawerHeader>
          <DrawerBody className="w-full max-w-[356px] gap-2 py-0">
            <OpenedRightSideBarContent
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  },
);

export default OpenedRightSideBar;

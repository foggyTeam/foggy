'use client';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Tab,
} from '@heroui/react';
import { Tabs } from '@heroui/tabs';
import { observer } from 'mobx-react-lite';
import { bg_container, sidebar_layout } from '@/app/lib/types/styles';
import clsx from 'clsx';
import { User2Icon, UserCog2Icon } from 'lucide-react';
import { Button } from '@heroui/button';
import userStore from '@/app/stores/userStore';
import { Avatar } from '@heroui/avatar';
import settingsStore from '@/app/stores/settingsStore';
import { useRouter } from 'next/navigation';

const OpenedSideBar = observer(
  ({
    activeTab,
    setActiveTab,
    isOpened,
    closeSideBar,
  }: {
    activeTab: 'projects' | 'teams' | 'notifications';
    setActiveTab: (newTab: 'projects' | 'teams' | 'notifications') => void;
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
          sidebar_layout,
          'h-fit w-fit',
          'transform transition-all hover:bg-opacity-65 hover:pr-0.5',
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
                  icon={<User2Icon className="h-64 w-64 stroke-default-200" />}
                  name={userStore.user?.name || undefined}
                  src={userStore.user?.image || undefined}
                  size="lg"
                  color="default"
                />
              </Button>
              <p className="text-small font-medium text-default-800">
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
              <UserCog2Icon className="stroke-default-500" />
            </Button>
          </DrawerHeader>
          <DrawerBody className="gap-2 py-0">
            <Tabs
              defaultSelectedKey={activeTab}
              onSelectionChange={setActiveTab}
              variant="underlined"
              className="pl-0 font-medium"
              classNames={{
                panel: 'py-0',
                cursor: 'invisible',
                tab: 'pl-0',
              }}
            >
              <Tab key="projects" title={settingsStore.t.menu.tabs.projects}>
                Your projects!
              </Tab>
              <Tab key="teams" title={settingsStore.t.menu.tabs.teams}>
                Your teams!
              </Tab>
              <Tab
                key="notifications"
                title={settingsStore.t.menu.tabs.notifications}
              >
                Many many notifications
              </Tab>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  },
);

export default OpenedSideBar;

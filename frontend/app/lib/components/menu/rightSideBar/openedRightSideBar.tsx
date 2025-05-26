'use client';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
} from '@heroui/drawer';
import { Tab, Tabs } from '@heroui/tabs';
import { observer } from 'mobx-react-lite';
import { bg_container, right_sidebar_layout } from '@/app/lib/types/styles';
import clsx from 'clsx';
import { ChevronLeftIcon, User2Icon, UserCog2Icon } from 'lucide-react';
import { Button } from '@heroui/button';
import userStore from '@/app/stores/userStore';
import { Avatar } from '@heroui/avatar';
import settingsStore from '@/app/stores/settingsStore';
import { useRouter } from 'next/navigation';
import projectsStore from '@/app/stores/projectsStore';
import RightSideBarElementCard from '@/app/lib/components/menu/rightSideBar/rightSideBarElementCard';
import React from 'react';
import teamsStore from '@/app/stores/teamsStore';

const OpenedRightSideBar = observer(
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
          right_sidebar_layout,
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
              selectedKey={activeTab}
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
                <div className="flex flex-col gap-2">
                  {
                    // TODO: show only recent projects / teams
                  }
                  {projectsStore.allProjects.slice(0, 4).map((project) => (
                    <RightSideBarElementCard
                      key={project.id}
                      element={project}
                      isActive={projectsStore.activeProject?.id === project.id}
                    />
                  ))}
                  <RightSideBarElementCard
                    link={{
                      href: '/',
                      text: settingsStore.t.menu.projects.seeAll,
                      Icon: ChevronLeftIcon,
                    }}
                  />
                </div>
              </Tab>
              <Tab key="teams" title={settingsStore.t.menu.tabs.teams}>
                <div className="flex flex-col gap-2">
                  {teamsStore.allTeams.slice(0, 4).map((team) => (
                    <RightSideBarElementCard
                      key={team.id}
                      element={team}
                      isActive={teamsStore.activeTeam?.id === team.id}
                    />
                  ))}
                  <RightSideBarElementCard
                    link={{
                      href: '/',
                      text: settingsStore.t.menu.teams.seeAll,
                      Icon: ChevronLeftIcon,
                    }}
                  />
                </div>
              </Tab>
              {
                // TODO: add notifications
              }
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

export default OpenedRightSideBar;

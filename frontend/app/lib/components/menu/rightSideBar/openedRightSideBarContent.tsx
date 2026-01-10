'use client';
import { Tab, Tabs } from '@heroui/tabs';
import { observer } from 'mobx-react-lite';
import { ChevronLeftIcon } from 'lucide-react';
import settingsStore from '@/app/stores/settingsStore';
import projectsStore from '@/app/stores/projectsStore';
import RightSideBarElementCard from '@/app/lib/components/menu/rightSideBar/rightSideBarElementCard';
import React, { Dispatch, SetStateAction } from 'react';
import teamsStore from '@/app/stores/teamsStore';
import AllNotifications from '@/app/lib/components/notifications/allNotifications';

const OpenedRightSideBarContent = observer(
  ({
    activeTab,
    setActiveTab,
  }: {
    activeTab: 'projects' | 'teams' | 'notifications';
    setActiveTab: Dispatch<SetStateAction<any>>;
  }) => {
    return (
      <Tabs
        defaultSelectedKey={activeTab}
        selectedKey={activeTab}
        onSelectionChange={setActiveTab}
        variant="underlined"
        className="w-full font-medium sm:w-fit sm:pl-0"
        classNames={{
          base: 'w-full max-w-full sm:w-fit overflow-x-auto scrollbar-hide',
          tabList: 'sm:gap-2 gap-1 w-full min-w-fit  sm:w-fit',
          panel: 'sm:py-0 p-0 h-full',
          cursor: 'invisible',
          tab: 'sm:pl-0 sm:pr-10 px-2',
        }}
      >
        <Tab key="projects" title={settingsStore.t.menu.tabs.projects}>
          <div className="flex flex-col gap-2">
            {
              // TODO: show only recent projects / teams
            }
            {projectsStore.allProjects.slice(0, 4).map((project) => (
              <RightSideBarElementCard
                type="project"
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
                type="team"
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
        <Tab
          key="notifications"
          title={settingsStore.t.menu.tabs.notifications}
        >
          <AllNotifications />
        </Tab>
      </Tabs>
    );
  },
);

export default OpenedRightSideBarContent;

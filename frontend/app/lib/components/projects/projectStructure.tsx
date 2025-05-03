'use client';

import { observer } from 'mobx-react-lite';
import { useDisclosure } from '@heroui/modal';
import ProjectSettingsModal from '@/app/lib/components/projects/projectSettingsModal';
import { Avatar } from '@heroui/avatar';
import clsx from 'clsx';
import projectsStore from '@/app/stores/projectsStore';
import { Button } from '@heroui/button';
import { SettingsIcon } from 'lucide-react';
import settingsStore from '@/app/stores/settingsStore';
import React from 'react';
import ProjectTree from '@/app/lib/components/projects/projectTree/projectTree';
import CheckAccess from '@/app/lib/utils/checkAccess';

const ProjectStructure = observer(() => {
  const {
    isOpen: isSettingsOpen,
    onOpen: onSettingsOpen,
    onOpenChange: onSettingsOpenChange,
  } = useDisclosure();

  return (
    <>
      <div className="flex h-full w-full flex-col gap-4 overflow-clip text-sm">
        <div className="flex flex-col gap-4">
          <div className="flex h-fit w-full items-center justify-between gap-4">
            <div className="flex h-fit items-center justify-start gap-4">
              <Avatar
                size="lg"
                color="primary"
                name={projectsStore.activeProject?.name}
                src={projectsStore.activeProject?.avatar}
              />
              <h1 className="font-medium">
                {projectsStore.activeProject?.name}
              </h1>
            </div>
            {CheckAccess(['admin', 'owner']) && (
              <Button onPress={onSettingsOpen} isIconOnly variant="light">
                <SettingsIcon className="stroke-default-500" />
              </Button>
            )}
          </div>
          <p
            className={clsx(
              'line-clamp-4 pr-0.5 text-start italic',
              !!projectsStore.activeProject?.description
                ? 'text-default-700'
                : 'text-default-400',
            )}
          >
            {!!projectsStore.activeProject?.description
              ? projectsStore.activeProject?.description
              : settingsStore.t.main.noProjectDescription}
          </p>
        </div>

        <div className="flex h-full min-h-96 flex-col gap-4">
          <h1 className="font-medium">
            {settingsStore.t.projects.projectSections}
          </h1>
          <div
            className={clsx(
              'relative h-full w-full flex-1 overflow-y-auto pt-0.5',
              'scrollbar-thin scrollbar-track-white/20 scrollbar-thumb-default-300',
              'scrollbar-track-rounded-full scrollbar-thumb-rounded-full',
            )}
          >
            <ProjectTree />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-50 h-16 bg-gradient-to-t from-default-50/50" />
      </div>
      {isSettingsOpen && (
        <ProjectSettingsModal
          isOpen={isSettingsOpen}
          onOpenChange={onSettingsOpenChange}
        />
      )}
    </>
  );
});

export default ProjectStructure;

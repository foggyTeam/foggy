import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import React from 'react';
import ProjectStructure from '@/app/lib/components/projects/projectStructure';
import AllProjectMembers from '@/app/lib/components/projects/allProjectMembers';
import AdaptiveContainer from '@/app/lib/components/adaptiveContainer';

export default async function ProjectPage() {
  return (
    <AdaptiveContainer
      desktopContainerClassName="flex h-full w-full items-end justify-center gap-8 py-8 pr-24 pl-8"
      mobileTabs={[
        { key: 'structure', titleKey: 'project' },
        { key: 'allMembers', titleKey: 'participants' },
      ]}
    >
      <div
        key="allMembers"
        className={clsx(
          'flex h-full w-full flex-col items-center justify-center sm:max-h-[640px] sm:max-w-md',
          bg_container_no_padding,
          'px-4 pt-4 sm:rounded-br-[64px] sm:px-8 sm:pt-8',
        )}
      >
        <AllProjectMembers />
      </div>
      <div
        key="structure"
        className={clsx(
          'flex h-full w-full flex-col items-center justify-center sm:max-w-4xl',
          bg_container_no_padding,
          'px-4 pt-4 sm:rounded-tr-[64px] sm:px-8 sm:pt-8',
        )}
      >
        <ProjectStructure />
      </div>
    </AdaptiveContainer>
  );
}

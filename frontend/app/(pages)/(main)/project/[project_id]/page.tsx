import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import React from 'react';
import AllProjectMembers from '@/app/lib/components/projects/allProjectMembers';
import ProjectStructure from '@/app/lib/components/projects/projectStructure';

export default async function ProjectPage() {
  return (
    <>
      <div className="flex h-screen w-screen items-end justify-center gap-8 py-8 pl-8 pr-24">
        <div
          className={clsx(
            'flex h-full max-h-[640px] w-full max-w-md flex-col items-center justify-center',
            bg_container_no_padding,
            'rounded-br-[64px] px-8 pt-8',
          )}
        >
          <AllProjectMembers />
        </div>
        <div
          className={clsx(
            'flex h-full w-full max-w-4xl flex-col items-center justify-center',
            bg_container_no_padding,
            'rounded-tr-[64px] px-8 pt-8',
          )}
        >
          <ProjectStructure />
        </div>
      </div>
    </>
  );
}

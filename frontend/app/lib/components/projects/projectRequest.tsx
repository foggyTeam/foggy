'use client';

import { observer } from 'mobx-react-lite';
import { Project } from '@/app/lib/types/definitions';
import { Avatar } from '@heroui/avatar';
import clsx from 'clsx';
import settingsStore from '@/app/stores/settingsStore';
import React from 'react';
import CompareByRole from '@/app/lib/utils/compareByRole';
import MediumMemberCard from '@/app/lib/components/members/mediumMemberCard';
import RequestForm from '@/app/lib/components/requestForm';

const ProjectRequest = observer(
  ({ project }: { project: Project | undefined }) => {
    return (
      <div className="flex h-fit w-fit flex-col gap-4 overflow-clip text-sm">
        <div className="flex h-fit flex-col gap-4">
          <div className="flex h-fit w-fit items-center justify-between gap-4">
            <div className="flex h-fit items-center justify-start gap-4">
              <Avatar
                size="lg"
                color="primary"
                name={project?.name}
                src={project?.avatar}
              />
              <h1 className="font-medium">{project?.name}</h1>
            </div>
          </div>
          <p
            className={clsx(
              'line-clamp-4 pr-0.5 text-start italic',
              !!project?.description ? 'text-default-700' : 'text-default-400',
            )}
          >
            {!!project?.description
              ? project.description
              : settingsStore.t.main.noProjectDescription}
          </p>
        </div>
        <div className="mt-0.5 grid max-h-full w-full grid-cols-2 gap-1">
          {project.members
            .sort(CompareByRole)
            .slice(0, 7)
            .map((member, index) => (
              <MediumMemberCard key={index} {...member} />
            ))}
          {project.members.length > 7 && (
            <p className="h-8 content-center justify-start px-4 italic">
              {settingsStore.t.main.andNMore.replace(
                '_',
                (project.members.length - 7).toString(),
              )}
            </p>
          )}
        </div>

        <RequestForm id={project?.id} type="project" />
      </div>
    );
  },
);

export default ProjectRequest;

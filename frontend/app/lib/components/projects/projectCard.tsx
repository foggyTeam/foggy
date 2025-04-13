'use client';

import { Project } from '@/app/lib/types/definitions';
import { Avatar, AvatarGroup } from '@heroui/avatar';
import { StarIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import React, { useState } from 'react';
import projectsStore from '@/app/stores/projectsStore';
import clsx from 'clsx';
import ProjectMemberCard from '@/app/lib/components/projects/projectMemberCard';
import { el_animation } from '@/app/lib/types/styles';
import settingsStore from '@/app/stores/settingsStore';
import GetDateTime from '@/app/lib/utils/getDateTime';

function byRole(a, b) {
  const rolePriority = {
    owner: 5,
    admin: 4,
    team: 3,
    editor: 2,
    reader: 1,
  };

  return rolePriority[b.role] - rolePriority[a.role];
}

export default function ProjectCard(project: Project) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={clsx(
        'flex flex-col items-center justify-between gap-1 rounded-2xl bg-white px-3 py-2 shadow-container hover:bg-default-50',
        el_animation,
        isExpanded ? 'h-fit w-[600px]' : 'h-24 w-72',
      )}
    >
      <div className="flex h-fit w-full items-center justify-between gap-2">
        <div className="flex items-center justify-start gap-2">
          <Avatar
            size="md"
            color="primary"
            name={project.name.toUpperCase()}
            src={project.avatar}
          />
          <h1 className="font-medium transition-colors duration-300 hover:text-f_accent">
            <a /*TODO: link to this project page*/ href={'/'}>{project.name}</a>
          </h1>
        </div>
        <Button
          onPress={() =>
            projectsStore.updateProject(project.id, {
              favorite: !project.favorite,
            })
          }
          isIconOnly
          variant="light"
          size="sm"
          radius="lg"
        >
          <StarIcon
            className={`stroke-default-300 ${project.favorite ? 'fill-default-300' : ''}`}
          />
        </Button>
      </div>

      <div
        className={clsx(
          'flex h-full w-full',
          isExpanded ? 'flex-col gap-2' : 'items-end justify-between gap-1',
        )}
      >
        <div className="h-fit w-full">
          <p
            className={clsx(
              'pr-0.5 italic text-default-700',
              isExpanded ? 'line-clamp-4' : 'line-clamp-2',
            )}
          >
            {project.description}
          </p>
        </div>
        {isExpanded ? (
          <div className="mt-1 grid max-h-full w-full grid-cols-2 gap-2">
            {project.members
              .sort(byRole)
              .slice(0, 7)
              .map((member) => (
                <ProjectMemberCard key={member.id} {...member} />
              ))}
            {project.members.length > 7 && (
              <Button
                // TODO: link to this project page
                variant="bordered"
                className="h-8 items-center justify-start border-none px-4 italic"
              >
                {settingsStore.t.main.andNMore.replace(
                  '_',
                  project.members.length - 7,
                )}
              </Button>
            )}
          </div>
        ) : (
          <AvatarGroup>
            {project.members.slice(0, 3).map((member) => (
              <Avatar
                classNames={{
                  base: 'h-7 w-7 border-white border-1.5',
                }}
                color="primary"
                key={member.id}
                name={member.nickname}
                src={member.avatar}
              />
            ))}
            <Avatar
              classNames={{
                base: 'h-7 w-7 border-white border-2',
              }}
              name={`+${project.members.length - 3}`}
            />
          </AvatarGroup>
        )}
      </div>

      {isExpanded && (
        <p className="w-full py-0.5 text-end text-xs text-default-700">
          {GetDateTime(project.lastChange)}
        </p>
      )}
    </div>
  );
}

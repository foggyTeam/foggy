'use client';

import { Project } from '@/app/lib/types/definitions';
import { Avatar, AvatarGroup } from '@heroui/avatar';
import { StarIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import React, { useEffect, useRef, useState } from 'react';
import projectsStore from '@/app/stores/projectsStore';
import clsx from 'clsx';
import MediumMemberCard from '@/app/lib/components/members/mediumMemberCard';
import {
  el_animation,
  project_tile,
  project_tile_exp,
} from '@/app/lib/types/styles';
import settingsStore from '@/app/stores/settingsStore';
import GetDateTime from '@/app/lib/utils/getDateTime';
import CompareByRole from '@/app/lib/utils/compareByRole';

export default function ProjectCard(project: Project) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node))
        setIsExpanded(false);
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={() => setIsExpanded(true)}
      className={clsx(
        'box-border flex flex-col items-center justify-between gap-1 rounded-2xl bg-white px-3 py-2 shadow-container hover:bg-default-50',
        el_animation,
        isExpanded ? 'h-fit w-[576px]' : 'h-24 w-[284px] cursor-pointer',
        isExpanded ? project_tile_exp : project_tile,
      )}
    >
      <div className="flex h-fit w-full items-center justify-between gap-2">
        <div className="flex items-center justify-start gap-2 overflow-hidden">
          <Avatar
            size="md"
            color="primary"
            name={project.name.toUpperCase()}
            src={project.avatar}
          />
          <h1
            className={clsx(
              'truncate text-nowrap font-medium accent-link',
              !isExpanded && 'max-w-40',
            )}
          >
            <a
              onClick={(event) => event.stopPropagation()}
              href={`project/${project.id}`}
            >
              {project.name}
            </a>
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
          isExpanded ? 'flex-col gap-1' : 'items-end justify-between gap-1',
        )}
      >
        <div className="h-fit w-full">
          <p
            className={clsx(
              'pr-0.5 text-start italic',
              isExpanded ? 'line-clamp-4' : 'line-clamp-2',
              !!project.description ? 'text-default-700' : 'text-default-400',
            )}
          >
            {!!project.description
              ? project.description
              : settingsStore.t.main.noProjectDescription}
          </p>
        </div>
        {isExpanded ? (
          <div className="mt-0.5 grid max-h-full w-full grid-cols-2 gap-1">
            {project.members
              .sort(CompareByRole)
              .slice(0, 7)
              .map((member, index) => (
                <MediumMemberCard key={index} {...member} />
              ))}
            {project.members.length > 7 && (
              <a
                href={`project/${project.id}`}
                className="h-8 content-center justify-start px-4 italic accent-link"
              >
                {settingsStore.t.main.andNMore.replace(
                  '_',
                  (project.members.length - 7).toString(),
                )}
              </a>
            )}
          </div>
        ) : (
          <AvatarGroup>
            {project.members.slice(0, 3).map((member, index) => (
              <Avatar
                classNames={{
                  base: 'h-7 w-7 border-white border-1.5',
                }}
                key={index}
                name={member.nickname}
                src={member.avatar}
              />
            ))}
            {project.members.length - 3 > 0 && (
              <Avatar
                classNames={{
                  base: 'h-7 w-7 border-white border-2',
                }}
                name={`+${project.members.length - 3}`}
              />
            )}
          </AvatarGroup>
        )}
      </div>
      {isExpanded && (
        <p className="w-full text-end text-xs text-default-700">
          {GetDateTime(project.lastChange)}
        </p>
      )}
    </div>
  );
}

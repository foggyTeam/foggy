'use client';

import { observer } from 'mobx-react-lite';
import { Team } from '@/app/lib/types/definitions';
import { Avatar } from '@heroui/avatar';
import settingsStore from '@/app/stores/settingsStore';
import React from 'react';
import CompareByRole from '@/app/lib/utils/compareByRole';
import MediumMemberCard from '@/app/lib/components/members/mediumMemberCard';
import RequestForm from '@/app/lib/components/requestForm';
import ProjectCard from '@/app/lib/components/projects/projectCard';
import { ScrollShadow } from '@heroui/scroll-shadow';

const TeamRequest = observer(({ team }: { team: Team | undefined }) => {
  return (
    <div className="flex h-fit w-full flex-col gap-4 overflow-clip text-sm">
      <div className="flex h-fit flex-col gap-4">
        <div className="flex h-fit items-center justify-start gap-4">
          <Avatar
            size="lg"
            color="primary"
            name={team?.name}
            src={team?.avatar}
          />
          <h1 className="font-medium">{team?.name}</h1>
        </div>
        {team?.settings.projectListIsPublic && (
          <ScrollShadow
            hideScrollBar={true}
            className="max-h-fit max-w-full"
            orientation="horizontal"
          >
            <div className="scrollbar-hide flex w-fit items-center gap-2 overflow-x-scroll scroll-smooth">
              {team?.projects.slice(0, 7).map((project) => {
                return (
                  <ProjectCard
                    key={project.id}
                    {...project}
                    isDisabled={true}
                    hideFavorite={true}
                  />
                );
              })}
            </div>
          </ScrollShadow>
        )}
      </div>
      {team?.settings.memberListIsPublic && (
        <div className="mt-0.5 grid max-h-full w-full grid-cols-2 gap-1">
          {team?.members
            ?.sort(CompareByRole)
            .slice(0, 7)
            .map((member, index) => (
              <MediumMemberCard key={index} {...member} />
            ))}
          {team?.members?.length > 7 && (
            <p className="h-8 content-center justify-start px-4 italic">
              {settingsStore.t.main.andNMore.replace(
                '_',
                (team?.members?.length - 7).toString(),
              )}
            </p>
          )}
        </div>
      )}

      {team && team?.settings.allowRequests && (
        <RequestForm id={team.id} type="team" />
      )}
    </div>
  );
});

export default TeamRequest;

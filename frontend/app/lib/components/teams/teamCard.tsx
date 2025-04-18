import { Team } from '@/app/lib/types/definitions';
import { el_animation, team_tile } from '@/app/lib/types/styles';
import { Avatar, AvatarGroup } from '@heroui/avatar';
import React from 'react';
import clsx from 'clsx';
import RoleCard from '@/app/lib/components/roleCard';
import userStore from '@/app/stores/userStore';

export default function TeamCard(team: Team) {
  return (
    <div
      onClick={() => console.log('hi')}
      className={clsx(
        'box-border flex items-center justify-between gap-1 rounded-2xl bg-white px-3 py-2 shadow-container hover:bg-default-50',
        el_animation,
        'h-16 w-[379px] cursor-pointer',
        team_tile,
      )}
    >
      <div className="flex h-full w-full items-center justify-start gap-2">
        <Avatar
          size="md"
          color="primary"
          name={team.name.toUpperCase()}
          src={team.avatar}
        />
        <div className="flex h-full flex-col items-start justify-between">
          <h1 className="max-w-32 truncate text-nowrap font-medium">
            {team.name}
          </h1>
          <RoleCard
            role={
              team.members?.find((member) => member.id === userStore.user?.id)
                ?.role || 'reader'
            }
          />
        </div>
      </div>

      <div className="flex h-full w-fit items-center justify-end">
        <AvatarGroup className="-space-x-4">
          {team.members?.slice(0, 5).map((member) => (
            <Avatar
              size="md"
              classNames={{
                base: 'border-white border-1.5',
              }}
              key={member.id}
              name={member.nickname}
              src={member.avatar}
            />
          ))}
          {team.members && team.members.length - 5 > 0 && (
            <Avatar
              size="md"
              classNames={{
                base: 'border-white border-2',
              }}
              name={`+${team.members.length - 5}`}
            />
          )}
        </AvatarGroup>
      </div>
    </div>
  );
}

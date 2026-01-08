import { Avatar } from '@heroui/avatar';
import React from 'react';
import { ProjectMember, TeamMember } from '@/app/lib/types/definitions';
import RoleCard from '@/app/lib/components/members/roleCard';
import userStore from '@/app/stores/userStore';
import settingsStore from '@/app/stores/settingsStore';
import { Button } from '@heroui/button';

export default function MediumMemberCard(member: ProjectMember | TeamMember) {
  return (
    <Button
      // TODO: navigate to member
      className="shadow-container hover:bg-primary-100 flex h-fit w-full items-center justify-between gap-1 rounded-full bg-[hsl(var(--heroui-background))] pr-1 pl-0 transition-colors duration-300"
    >
      <div className="flex items-center justify-start gap-1">
        <Avatar
          size="sm"
          classNames={{
            base: 'border-[hsl(var(--heroui-background))] border-1.5',
          }}
          className="p-0"
          name={member.nickname}
          src={member.avatar}
        />
        <p className="text-small text-default-700 font-bold">
          {member.nickname}
        </p>
        {userStore.user?.id === member.id && (
          <p className="text-default-700 text-xs">{settingsStore.t.main.you}</p>
        )}
      </div>
      <RoleCard role={member.role} />
    </Button>
  );
}

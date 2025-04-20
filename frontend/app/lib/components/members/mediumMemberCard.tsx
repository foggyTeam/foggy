import { Avatar } from '@heroui/avatar';
import React from 'react';
import { ProjectMember, TeamMember } from '@/app/lib/types/definitions';
import RoleCard from '@/app/lib/components/roleCard';
import userStore from '@/app/stores/userStore';
import settingsStore from '@/app/stores/settingsStore';
import { Button } from '@heroui/button';

export default function MediumMemberCard(member: ProjectMember | TeamMember) {
  return (
    <Button
      // TODO: navigate to member
      className="flex h-fit w-full items-center justify-between gap-1 rounded-full bg-white pl-0 pr-1 transition-colors duration-300 shadow-container hover:bg-primary-100"
    >
      <div className="flex items-center justify-start gap-1">
        <Avatar
          size="sm"
          classNames={{
            base: 'border-white border-1.5',
          }}
          className="p-0"
          name={member.nickname}
          src={member.avatar}
        />
        <p className="text-small font-bold text-default-700">
          {member.nickname}
        </p>
        {userStore.user?.id === member.id && (
          <p className="text-xs text-default-700">{settingsStore.t.main.you}</p>
        )}
      </div>
      <RoleCard role={member.role} />
    </Button>
  );
}

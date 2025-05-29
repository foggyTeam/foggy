import { ProjectMember, Team, TeamMember } from '@/app/lib/types/definitions';
import { Avatar } from '@heroui/avatar';
import React from 'react';

export default function SmallMemberCard({
  member,
  teamLabel,
}: {
  member: ProjectMember | TeamMember | Team;
  teamLabel?: boolean;
}) {
  return (
    <div className="flex h-fit w-full items-center justify-start gap-1 pl-0 pr-1">
      <Avatar
        size="sm"
        className="p-0"
        name={
          ('nickname' in member && member.nickname) ||
          ('name' in member && member.name) ||
          ''
        }
        src={member.avatar}
      />
      <p className="text-small font-bold text-default-700">
        {('nickname' in member && member.nickname) ||
          ('name' in member && member.name) ||
          ''}
      </p>
    </div>
  );
}

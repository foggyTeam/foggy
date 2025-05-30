import { ProjectMember, Team, TeamMember } from '@/app/lib/types/definitions';
import { Avatar } from '@heroui/avatar';
import React from 'react';
import RoleCard from '@/app/lib/components/members/roleCard';

export default function SmallMemberCard({
  member,
  teamLabel,
}: {
  member: Partial<ProjectMember | TeamMember | Team>;
  teamLabel?: boolean;
}) {
  return (
    <div className="flex h-fit w-full items-center justify-start gap-2 pl-0 pr-1">
      <Avatar
        size="sm"
        className="w-9 p-0"
        name={
          ('nickname' in member && member.nickname) ||
          ('name' in member && member.name) ||
          ''
        }
        src={member.avatar}
      />
      <div className="flex w-full flex-nowrap justify-between gap-4">
        <p className="text-small font-bold text-default-700">
          {('nickname' in member && member.nickname) ||
            ('name' in member && member.name) ||
            ''}
        </p>
        {teamLabel && <RoleCard role="TEAM" />}
      </div>
    </div>
  );
}

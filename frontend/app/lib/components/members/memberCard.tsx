import { Avatar } from '@heroui/avatar';
import React from 'react';
import { ProjectMember, TeamMember } from '@/app/lib/types/definitions';
import RoleCard from '@/app/lib/components/members/roleCard';
import clsx from 'clsx';
import { el_animation, team_tile } from '@/app/lib/types/styles';
import { IdCardIcon, LogOutIcon, UserRoundXIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import userStore from '@/app/stores/userStore';
import settingsStore from '@/app/stores/settingsStore';
import Link from 'next/link';

export default function MemberCard(member: ProjectMember | TeamMember) {
  return (
    <div
      className={clsx(
        'box-border flex items-center justify-between gap-1 rounded-2xl bg-white px-3 py-2 shadow-container hover:bg-default-50',
        el_animation,
        'h-16 w-[98%] max-w-[379px]',
        team_tile,
      )}
    >
      <div className="flex h-full w-full items-center justify-start gap-2">
        <Avatar
          size="md"
          color="primary"
          className="min-h-10 min-w-10"
          name={member.nickname.toUpperCase()}
          src={member.avatar}
        />
        <div className="flex h-full w-full flex-col items-start justify-between">
          <div className="flex items-center gap-1">
            <h1 className="max-w-32 truncate text-nowrap font-medium">
              {/* TODO: navigate to member page */}
              <Link href="/" className="accent-link">
                {member.nickname}
              </Link>
            </h1>
            {userStore.user?.id === member.id && (
              <p className="text-xs text-default-700">
                {settingsStore.t.main.you}
              </p>
            )}
          </div>
          <div className="flex items-center justify-start gap-2">
            <RoleCard role={member.role} />
            {'team' in member && member.team && <RoleCard role={member.team} />}
          </div>
        </div>
      </div>

      <div className="flex h-full w-fit items-center justify-start gap-2">
        {userStore.user?.id === member.id ? (
          <Button
            onPress={() => console.log('leave project')}
            isIconOnly
            color="danger"
            variant="light"
            size="sm"
          >
            <LogOutIcon className="stroke-danger" />
          </Button>
        ) : (
          <>
            <Button
              onPress={() => console.log('edit role')}
              isIconOnly
              variant="light"
              size="sm"
            >
              <IdCardIcon className="stroke-default-300" />
            </Button>
            <Button
              onPress={() => console.log('delete member')}
              isIconOnly
              color="danger"
              variant="light"
              size="sm"
            >
              <UserRoundXIcon className="stroke-danger" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

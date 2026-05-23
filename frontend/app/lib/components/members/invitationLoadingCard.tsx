'use client';

import { Progress } from '@heroui/progress';
import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
import FoggySmall from '@/app/lib/components/svg/foggySmall';
import { useEffect, useState } from 'react';
import { ProcessInvitationToken } from '@/app/lib/server/actions/membersServerActions';
import { useRouter } from 'next/navigation';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import { Project, Team } from '@/app/lib/types/definitions';
import ProjectRequest from '@/app/lib/components/projects/projectRequest';
import TeamRequest from '@/app/lib/components/teams/teamRequest';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import userStore from '@/app/stores/userStore';

export default function InvitationLoadingCard({
  entityType,
  token,
}: {
  entityType: 'project' | 'team';
  token: string;
}) {
  const { commonSize } = useAdaptiveParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [requiredEntity, setRequiredEntity] = useState<
    Partial<Project> | Partial<Team>
  >();

  async function acceptInvitation() {
    if (!requiredEntity) return;

    setIsLoading(true);
    try {
      const result = await ProcessInvitationToken(entityType, token, true);
      if (typeof result !== 'string')
        throw new Error(result.errors[0].toString());

      addToast({
        color: 'success',
        severity: 'success',
        title:
          settingsStore.t.toasts.members.invitationLink.accepted[entityType],
      });
      router.push(`/${entityType}/${requiredEntity.id}`);
    } catch (e: any) {
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.members.invitationLink.error.title,
        description: e.toString(),
      });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    ProcessInvitationToken(entityType, token)
      .then((result: Partial<Team> | Partial<Project>) => {
        for (const member of result.members || [])
          if (member.id === userStore.user?.id) {
            router.push(`/${entityType}/${result.id}`);
            return;
          }

        setRequiredEntity(
          Object.assign(result, {
            settings: { ...result.settings, allowRequests: false },
          }),
        );
        setIsLoading(false);
      })
      .catch((e: any) => {
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.members.invitationLink.error.title,
          description: e.toString(),
        });
        router.push(`/`);
      });
  }, []);

  return (
    <div className="bg-background/50 absolute top-0 left-0 z-30 flex h-full w-full items-center justify-center backdrop-blur-xl">
      <div
        className={clsx(
          'flex h-fit w-full flex-col items-center justify-center gap-4 transition-all',
          bg_container,
          'px-12',
          isLoading ? 'max-w-sm' : 'max-w-xl',
        )}
      >
        {isLoading ? (
          <div className="flex h-fit w-full flex-col items-center justify-center gap-4 px-4">
            <FoggySmall
              width={128}
              height={128}
              alt={'foggy logo'}
              withGradient
              className="stroke-primary stroke-0 transition-all duration-300"
            />
            <Progress
              size="md"
              classNames={{
                indicator: 'bg-linear-to-r from-primary-500 to-danger-400',
              }}
              isIndeterminate
              aria-label="Loading..."
              className="w-full"
            />
          </div>
        ) : (
          <div className="flex h-fit w-full flex-col items-center justify-center gap-4 px-4">
            {entityType === 'project' ? (
              <ProjectRequest project={requiredEntity as Project} />
            ) : (
              <TeamRequest team={requiredEntity as Team} />
            )}
            <FButton
              size={commonSize}
              color="primary"
              variant="solid"
              className="w-full"
              onPress={acceptInvitation}
            >
              {settingsStore.t.members.addMember.acceptInvitation[entityType]}
            </FButton>
          </div>
        )}
      </div>
    </div>
  );
}

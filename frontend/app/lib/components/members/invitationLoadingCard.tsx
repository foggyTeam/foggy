'use client';

import { Progress } from '@heroui/progress';
import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
import FoggySmall from '@/app/lib/components/svg/foggySmall';
import { useEffect } from 'react';
import { ProcessInvitationToken } from '@/app/lib/server/actions/membersServerActions';
import { useRouter } from 'next/navigation';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';

export default function InvitationLoadingCard({ token }: { token: string }) {
  const router = useRouter();
  useEffect(() => {
    // TODO: consider decryption type
    ProcessInvitationToken(token)
      .then(
        (result: {
          accepted: boolean;
          type: 'team' | 'project';
          id: string;
        }) => {
          if (result.accepted) {
            addToast({
              color: 'success',
              severity: 'success',
              title:
                settingsStore.t.toasts.members.invitationLink.accepted[
                  result.type
                ],
            });
            router.push(`/${result.type}/${result.id}`);
          } else {
            addToast({
              color: 'warning',
              severity: 'warning',
              title: settingsStore.t.toasts.members.invitationLink.error.title,
              description:
                settingsStore.t.toasts.members.invitationLink.error.description,
            });
            router.push(`/${result.type}/request/${result.id}`);
          }
        },
      )
      .catch((e: any) => {
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.members.invitationLink.error.title,
          description: e.toString(),
        });
        router.push('/');
      });
  }, []);

  return (
    <div className="bg-default-900/10 absolute top-0 left-0 z-30 flex h-screen w-screen items-center justify-center backdrop-blur-xl">
      <div
        className={clsx(
          'flex h-fit w-full max-w-sm flex-col items-center justify-center gap-4',
          bg_container,
          'px-12',
        )}
      >
        <div className="flex h-fit w-full flex-col items-center justify-center gap-4">
          <FoggySmall
            width={128}
            height={128}
            alt={'foggy logo'}
            className="stroke-primary fill-[url(#logo-gradient)] stroke-0 transition-all duration-300"
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
      </div>
    </div>
  );
}

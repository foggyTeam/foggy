import { bg_container_no_padding } from '@/app/lib/types/styles';
import React from 'react';
import ForbiddenState from '@/app/lib/components/forbiddenState';
import clsx from 'clsx';
import InvitationLoadingCard from '@/app/lib/components/members/invitationLoadingCard';

export default async function InvitationTokenPage({
  params,
}: Readonly<{
  params: Promise<{ token: string }>;
}>) {
  const { token } = await params;

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-8 px-24 py-8">
      <InvitationLoadingCard token={token} />
    </div>
  );
}

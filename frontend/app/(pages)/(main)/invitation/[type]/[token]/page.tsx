import React from 'react';
import InvitationLoadingCard from '@/app/lib/components/members/invitationLoadingCard';

export default async function InvitationTokenPage({
  params,
}: Readonly<{
  params: Promise<{ type: 'project' | 'team'; token: string }>;
}>) {
  const { type, token } = await params;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 px-24 py-8">
      <InvitationLoadingCard entityType={type} token={token} />
    </div>
  );
}

'use client';
import { HeroUIProvider } from '@heroui/react';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session;
}) {
  return (
    <SessionProvider session={session}>
      <HeroUIProvider>{children}</HeroUIProvider>
    </SessionProvider>
  );
}

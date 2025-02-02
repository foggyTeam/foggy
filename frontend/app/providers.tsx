'use client';
import { HeroUIProvider } from '@heroui/react';
import React from 'react';
import { SessionProvider } from 'next-auth/react';

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider session={session}>
      <HeroUIProvider>{children}</HeroUIProvider>
    </SessionProvider>
  );
}

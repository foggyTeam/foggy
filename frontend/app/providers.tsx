'use client';
import { HeroUIProvider } from '@heroui/react';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ToastProvider } from '@heroui/toast';

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session;
}) {
  return (
    <SessionProvider session={session}>
      <ToastProvider toastOffset={4} />
      <HeroUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="system">
          {children}
        </NextThemesProvider>
      </HeroUIProvider>
    </SessionProvider>
  );
}

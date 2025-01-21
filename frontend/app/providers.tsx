'use client';
import { HeroUIProvider } from '@heroui/react';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <HeroUIProvider>{children}</HeroUIProvider>;
}

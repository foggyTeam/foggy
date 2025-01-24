'use client';
import { HeroUIProvider } from '@heroui/react';
import React from 'react';
import { useLocalObservable } from 'mobx-react-lite';
import settingsStore from '@/app/stores/settingsStore';
import { SettingsContext } from '@/app/stores/settingsContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const store = useLocalObservable(() => settingsStore);

  return (
    <HeroUIProvider>
      <SettingsContext.Provider value={store}>
        {children}
      </SettingsContext.Provider>
    </HeroUIProvider>
  );
}

'use client';

import LocaleSwitcher from '@/app/lib/components/menu/rightBottomBar/localeSwitcher';
import ThemeSwitcher from '@/app/lib/components/menu/rightBottomBar/themeSwitcher';
import React from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function RightBottomBar() {
  const path = usePathname();

  return (
    <div
      className={clsx(
        'absolute right-2 bottom-4 z-50 items-center gap-0.5',
        path === '/login' ? 'flex' : 'hidden sm:flex',
      )}
    >
      <ThemeSwitcher />
      <LocaleSwitcher />
    </div>
  );
}

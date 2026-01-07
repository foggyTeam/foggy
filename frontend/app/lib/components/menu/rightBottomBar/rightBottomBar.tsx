'use client';

import LocaleSwitcher from '@/app/lib/components/menu/rightBottomBar/localeSwitcher';
import ThemeSwitcher from '@/app/lib/components/menu/rightBottomBar/themeSwitcher';
import React from 'react';

export default function RightBottomBar() {
  return (
    <div className="invisible absolute right-2 bottom-4 z-50 flex items-center gap-0.5 sm:visible">
      <ThemeSwitcher />
      <LocaleSwitcher />
    </div>
  );
}

'use client';

import { Button } from '@heroui/button';
import React, { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  function switchTheme() {
    const newTheme = theme === 'dark' ? 'light' : 'dark';

    setTheme(newTheme);
  }

  if (!mounted) return null;

  return (
    <div className="invisible absolute right-16 bottom-4 z-50 sm:visible">
      <Button
        onPress={switchTheme}
        isIconOnly
        variant="light"
        size="md"
        className="font-semibold"
      >
        {theme === 'dark' ? (
          <MoonIcon className="stroke-default-500" />
        ) : (
          <SunIcon className="stroke-default-500" />
        )}
      </Button>
    </div>
  );
}

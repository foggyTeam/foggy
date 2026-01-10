'use client';

import { Button } from '@heroui/button';
import React, { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Skeleton } from '@heroui/skeleton';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

export default function ThemeSwitcher() {
  const { buttonSize } = useAdaptiveParams();
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme: theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  function switchTheme() {
    const newTheme = theme === 'dark' ? 'light' : 'dark';

    setTheme(newTheme);
  }

  if (!mounted)
    return (
      <Skeleton className="h-10 rounded-lg">
        <Button variant="light" isIconOnly size="md" />
      </Skeleton>
    );

  return (
    <Button
      onPress={switchTheme}
      isIconOnly
      variant="light"
      size={buttonSize}
      color="secondary"
    >
      {theme === 'light' ? (
        <MoonIcon className="stroke-secondary" />
      ) : (
        <SunIcon className="stroke-secondary" />
      )}
    </Button>
  );
}

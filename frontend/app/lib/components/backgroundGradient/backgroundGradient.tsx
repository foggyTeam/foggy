'use client';

import clsx from 'clsx';
import BackgroundCircle from '@/app/lib/components/backgroundGradient/backgroundCircle';
import { useTheme } from 'next-themes';
import { foggy_accent } from '@/tailwind.config';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export interface circleParams {
  width: number;
  height: number;
  rotation: number;
  duration: number;
  top: number;
  left: number;
  color: string;
}

const circles: { light: circleParams[]; dark: circleParams[] } = {
  light: [
    {
      width: 820,
      height: 480,
      rotation: -16,
      top: -10,
      left: -4,
      duration: 22,
      color: 'hsl(var(--heroui-primary-500)/0.8)',
    } as circleParams,
    {
      width: 900,
      height: 460,
      rotation: 10,
      top: -10,
      left: 22,
      duration: 26,
      color: 'hsl(var(--heroui-secondary-400)/0.7)',
    } as circleParams,
    {
      width: 620,
      height: 420,
      rotation: -8,
      top: -12,
      left: 76,
      duration: 20,
      color: 'hsl(var(--heroui-primary-400)/0.75)',
    } as circleParams,

    {
      width: 520,
      height: 820,
      rotation: 18,
      top: 18,
      left: -12,
      duration: 24,
      color: 'hsl(var(--heroui-primary-300)/0.6)',
    } as circleParams,
    {
      width: 420,
      height: 520,
      rotation: -24,
      top: 40,
      left: 16,
      duration: 16,
      color: 'hsl(var(--heroui-danger-300)/0.6)',
    } as circleParams,

    {
      width: 540,
      height: 840,
      rotation: -16,
      top: 22,
      left: 84,
      duration: 28,
      color: 'hsl(var(--heroui-secondary-500)/0.65)',
    } as circleParams,
    {
      width: 460,
      height: 520,
      rotation: 22,
      top: 46,
      left: 60,
      duration: 18,
      color: 'hsl(var(--heroui-secondary-400)/0.8)',
    } as circleParams,

    {
      width: 880,
      height: 500,
      rotation: 14,
      top: 82,
      left: -8,
      duration: 22,
      color: 'hsl(var(--heroui-primary-500)/0.8)',
    } as circleParams,
    {
      width: 820,
      height: 520,
      rotation: -10,
      top: 86,
      left: 26,
      duration: 20,
      color: 'hsl(var(--heroui-primary-300)/0.75)',
    } as circleParams,
    {
      width: 700,
      height: 480,
      rotation: 12,
      top: 80,
      left: 72,
      duration: 24,
      color: 'hsl(var(--heroui-secondary-500)/0.7)',
    } as circleParams,

    {
      width: 320,
      height: 260,
      rotation: 8,
      top: 94,
      left: -4,
      duration: 14,
      color: 'hsl(var(--heroui-warning-400)/0.45)',
    } as circleParams,
  ],

  dark: [
    {
      width: 860,
      height: 480,
      rotation: -14,
      top: -10,
      left: -4,
      duration: 26,
      color: `${foggy_accent.light['500']}BF`, // ~75%
    } as circleParams,
    {
      width: 820,
      height: 440,
      rotation: 6,
      top: -8,
      left: 20,
      duration: 30,
      color: 'hsl(var(--heroui-primary-300)/0.7)',
    } as circleParams,
    {
      width: 640,
      height: 400,
      rotation: -10,
      top: -10,
      left: 76,
      duration: 28,
      color: `${foggy_accent.light['600']}B3`,
    } as circleParams,

    {
      width: 500,
      height: 780,
      rotation: 18,
      top: 20,
      left: -12,
      duration: 32,
      color: `${foggy_accent.light['500']}80`,
    } as circleParams,
    {
      width: 520,
      height: 820,
      rotation: -18,
      top: 22,
      left: 84,
      duration: 34,
      color: `${foggy_accent.light['600']}80`,
    } as circleParams,

    {
      width: 860,
      height: 480,
      rotation: 14,
      top: 80,
      left: -8,
      duration: 30,
      color: `${foggy_accent.light['500']}B3`,
    } as circleParams,
    {
      width: 820,
      height: 500,
      rotation: -10,
      top: 84,
      left: 24,
      duration: 26,
      color: `${foggy_accent.light['400']}99`,
    } as circleParams,
    {
      width: 700,
      height: 460,
      rotation: 12,
      top: 80,
      left: 72,
      duration: 32,
      color: `${foggy_accent.light['600']}99`,
    } as circleParams,

    {
      width: 460,
      height: 460,
      rotation: 16,
      top: 4,
      left: 40,
      duration: 20,
      color: 'hsl(var(--heroui-secondary-300)/0.6)',
    } as circleParams,
    {
      width: 340,
      height: 360,
      rotation: -18,
      top: 40,
      left: 22,
      duration: 22,
      color: 'hsl(var(--heroui-primary-200)/0.6)',
    } as circleParams,
    {
      width: 360,
      height: 380,
      rotation: 14,
      top: 76,
      left: 46,
      duration: 24,
      color: 'hsl(var(--heroui-danger-500)/0.55)',
    } as circleParams,
  ],
};

export default function BackgroundGradient() {
  const { isMobile } = useAdaptiveParams();
  const { resolvedTheme } = useTheme();
  const [theme, setTheme] = useState('dark');

  const [isBoardPage, setIsBoardPage] = useState(false);
  const boardPageRegex = /^\/project\/[^\/]+\/[^\/]+\/[^\/]+$/;
  const path = usePathname();

  const currentCircles = circles[theme].filter((_, i) =>
    isMobile ? i % 2 === 0 : true,
  );

  useEffect(() => {
    setTheme((resolvedTheme as 'light' | 'dark') ?? 'light');
  }, [resolvedTheme]);

  useEffect(() => {
    setIsBoardPage(!!path.match(boardPageRegex));
  }, [path]);

  return (
    <div
      className={clsx(
        'bg-gradient fixed inset-0 -z-10 overflow-hidden transition-colors',
        theme === 'dark' ? 'bg-default-100 opacity-50' : 'bg-default-200',
      )}
    >
      {currentCircles.map((circle, index) => (
        <BackgroundCircle
          isBoardPage={isBoardPage}
          key={index}
          params={circle}
        />
      ))}
    </div>
  );
}

'use client';

import clsx from 'clsx';
import BackgroundCircle from '@/app/lib/components/backgroundGradient/backgroundCircle';
import { useTheme } from 'next-themes';
import { foggy_accent } from '@/tailwind.config';

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
      width: 200,
      height: 256,
      rotation: 16,
      top: -2,
      left: -2,
      duration: 8,
      color: 'hsl(var(--heroui-danger-300))',
    } as circleParams,
    {
      width: 300,
      height: 200,
      rotation: 32,
      top: 4,
      left: 4,
      duration: 16,
      color: 'hsl(var(--heroui-primary-500))',
    } as circleParams,
    {
      width: 400,
      height: 400,
      rotation: 16,
      top: 8,
      left: 40,
      duration: 24,
      color: 'hsl(var(--heroui-primary-500))',
    } as circleParams,
    {
      width: 324,
      height: 256,
      rotation: -12,
      top: 12,
      left: 50,
      duration: 12,
      color: 'hsl(var(--heroui-secondary-500))',
    } as circleParams,
    {
      width: 400,
      height: 324,
      rotation: 16,
      top: 85,
      left: 16,
      duration: 8,
      color: foggy_accent.light['200'],
    } as circleParams,
    {
      width: 256,
      height: 128,
      rotation: 32,
      top: 85,
      left: 24,
      duration: 18,
      color: 'hsl(var(--heroui-danger-300))',
    } as circleParams,
    {
      width: 200,
      height: 400,
      rotation: -32,
      top: 0,
      left: 85,
      duration: 16,
      color: foggy_accent.light['300'],
    } as circleParams,
  ],

  dark: [
    {
      width: 140,
      height: 180,
      rotation: 10,
      top: 6,
      left: 24,
      duration: 20,
      color: foggy_accent.light.DEFAULT,
    } as circleParams,
    {
      width: 160,
      height: 160,
      rotation: -12,
      top: 21,
      left: 67,
      duration: 22,
      color: foggy_accent.light['600'],
    } as circleParams,
    {
      width: 180,
      height: 110,
      rotation: 8,
      top: 80,
      left: 8,
      duration: 24,
      color: 'hsl(var(--heroui-primary-100))',
    } as circleParams,

    {
      width: 110,
      height: 130,
      rotation: 16,
      top: 56,
      left: 58,
      duration: 26,
      color: 'hsl(var(--heroui-secondary-200))',
    } as circleParams,
    {
      width: 88,
      height: 120,
      rotation: -14,
      top: 12,
      left: 88,
      duration: 28,
      color: 'hsl(var(--heroui-danger-500)/0.7)',
    } as circleParams,
  ],
};

const BackgroundGradient = ({
  backgroundColor,
}: {
  backgroundColor: string;
}) => {
  const { resolvedTheme } = useTheme();
  const currentCircles = circles[resolvedTheme];

  return (
    <div
      className={clsx(
        'transition-background absolute top-0 left-0 -z-10 h-full w-full overflow-hidden',
        resolvedTheme === 'dark' ? 'bg-default-100' : 'bg-default-200',
      )}
    >
      {currentCircles.map((circle, index) => (
        <BackgroundCircle key={index} params={circle} />
      ))}
    </div>
  );
};

export default BackgroundGradient;

'use client';

import clsx from 'clsx';
import {
  danger,
  foggy_accent,
  primary,
  secondary,
  to_rgb,
  warning,
} from '@/tailwind.config';
import BackgroundCircle from '@/app/lib/components/backgroundGradient/backgroundCircle';
import { useTheme } from 'next-themes';

export interface circleParams {
  width: number;
  height: number;
  rotation: number;
  duration: number;
  top: number;
  left: number;
  color: string;
}

const BackgroundGradient = ({
  backgroundColor,
}: {
  backgroundColor: string;
}) => {
  const { theme } = useTheme();
  const circles = [
    {
      width: 200,
      height: 256,
      rotation: 16,
      top: -2,
      left: -2,
      duration: 8,
      color: `rgb(${to_rgb(danger[theme]['300'])})`,
    } as circleParams,
    {
      width: 300,
      height: 200,
      rotation: 32,
      top: 4,
      left: 4,
      duration: 16,
      color: `rgb(${to_rgb(primary[theme]['500'])})`,
    } as circleParams,
    {
      width: 400,
      height: 400,
      rotation: 16,
      top: 8,
      left: 40,
      duration: 24,
      color: `rgb(${to_rgb(primary[theme]['500'])})`,
    } as circleParams,
    {
      width: 324,
      height: 256,
      rotation: -12,
      top: 12,
      left: 50,
      duration: 12,
      color: `rgb(${to_rgb(secondary[theme]['500'])})`,
    } as circleParams,
    {
      width: 400,
      height: 324,
      rotation: 16,
      top: 85,
      left: 16,
      duration: 8,
      color: `rgb(${to_rgb(foggy_accent[theme]['500'])})`,
    } as circleParams,
    {
      width: 256,
      height: 128,
      rotation: 32,
      top: 85,
      left: 24,
      duration: 18,
      color: `rgb(${to_rgb(warning[theme]['300'])})`,
    } as circleParams,
    {
      width: 200,
      height: 400,
      rotation: -32,
      top: 0,
      left: 85,
      duration: 16,
      color: `rgb(${to_rgb(foggy_accent[theme]['500'])})`,
    } as circleParams,
  ];

  return (
    <div
      className={clsx(
        'absolute top-0 left-0 -z-10 h-full w-full overflow-hidden',
        `bg-${backgroundColor}`,
      )}
    >
      {circles.map((circle, index) => (
        <BackgroundCircle key={index} params={circle} />
      ))}
    </div>
  );
};

export default BackgroundGradient;

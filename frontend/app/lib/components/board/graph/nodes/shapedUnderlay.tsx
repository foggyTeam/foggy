'use client';

import { GCustomNode } from '@/app/lib/types/definitions';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import { to_rgb } from '@/tailwind.config';
import clsx from 'clsx';

const shapePaths: Record<
  GCustomNode['data']['shape'],
  (w: number, h: number) => string
> = {
  rect: (w, h) => `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`,

  triangle: (w, h) => `M ${w / 2} 0 L ${w} ${h} L 0 ${h} Z`,

  pentagon: (w, h) => {
    const points = [
      [w / 2, 0],
      [w, h / 2],
      [w * 0.82, h],
      [w * 0.18, h],
      [0, h / 2],
    ];
    return `M ${points.map((p) => p.join(' ')).join(' L ')} Z`;
  },
  diamond: (w, h) =>
    `M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z`,
  circle: (w, h) =>
    `M ${w / 2} 0 A ${w / 2} ${h / 2} 0 1 1 ${w / 2 - 0.01} 0 Z`,
};

export default function ShapedUnderlay({
  shape,
  color,
}: {
  shape: GCustomNode['data']['shape'];
  color?: string;
}) {
  const path = shapePaths[shape](99, 99);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="-0.5 -0.5 100 100"
      preserveAspectRatio="none"
    >
      {shape === 'rect' ? (
        <rect
          vectorEffect="non-scaling-stroke, non-scaling-radius"
          width={99}
          height={99}
          className={clsx(
            bg_container_no_padding,
            'light:stroke-[hsl(var(--heroui-background)/0.5)] shadow-none shadow-yellow-500 dark:stroke-[hsl(var(--heroui-foreground)/0.08)]',
          )}
          paintOrder="stroke"
          strokeLinecap="round"
          rx="5%"
          strokeWidth={2}
          strokeLinejoin="round"
          style={{
            fill: color ? color : 'hsl(var(--heroui-background))',
            stroke: color ? `rgba(${to_rgb(color)}, 0.5)` : undefined,
            filter:
              'drop-shadow(2px 4px 10px 0 hsl(var(--heroui-primary-500)/0.06))',
          }}
        />
      ) : (
        <path
          vectorEffect="non-scaling-stroke"
          d={path}
          className={clsx(
            bg_container_no_padding,
            'light:stroke-[hsl(var(--heroui-background)/0.5)] shadow-none shadow-yellow-500 dark:stroke-[hsl(var(--heroui-foreground)/0.08)]',
          )}
          paintOrder="stroke"
          strokeLinecap="round"
          strokeWidth={2}
          strokeLinejoin="round"
          style={{
            fill: color ? color : 'hsl(var(--heroui-background))',
            stroke: color ? `rgba(${to_rgb(color)}, 0.5)` : undefined,
            filter:
              'drop-shadow(2px 4px 10px 0 hsl(var(--heroui-primary-500)/0.06))',
          }}
        />
      )}
    </svg>
  );
}

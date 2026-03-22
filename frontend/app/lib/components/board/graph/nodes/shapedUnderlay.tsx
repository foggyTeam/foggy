'use client';

import { GCustomNode } from '@/app/lib/types/definitions';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import { to_rgb } from '@/tailwind.config';

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
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="-1 -1 102 102"
      preserveAspectRatio="none"
    >
      <path
        d={shapePaths[shape](100, 100)}
        className={bg_container_no_padding + ' stroke'}
        style={{
          fill: color ? color : 'hsl(var(--heroui-background)/0.5)',
          stroke: color
            ? `rgba(${to_rgb(color)}, 0.2)`
            : 'hsl(var(--heroui-background)/0.1)',
        }}
      />
    </svg>
  );
}

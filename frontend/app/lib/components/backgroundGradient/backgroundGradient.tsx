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
    // ===== LIGHT: ВЕРХНЯЯ ЧАСТЬ =====
    {
      // Левый верх — чуть правее и немного ниже
      width: 820,
      height: 480,
      rotation: -16,
      top: -10,
      left: -4,
      duration: 22,
      color: 'hsl(var(--heroui-primary-500)/0.8)',
    } as circleParams,
    {
      // Верхний центр — secondary
      width: 900,
      height: 460,
      rotation: 10,
      top: -10,
      left: 22,
      duration: 26,
      color: 'hsl(var(--heroui-secondary-400)/0.7)',
    } as circleParams,
    {
      // Правый верх — светлый primary
      width: 620,
      height: 420,
      rotation: -8,
      top: -12,
      left: 76,
      duration: 20,
      color: 'hsl(var(--heroui-primary-400)/0.75)',
    } as circleParams,

    // ===== LIGHT: БОКОВЫЕ ЧАСТИ =====
    {
      // Левый край — вертикальный primary
      width: 520,
      height: 820,
      rotation: 18,
      top: 18,
      left: -12,
      duration: 24,
      color: 'hsl(var(--heroui-primary-300)/0.6)',
    } as circleParams,
    {
      // Тёплое пятно слева — осторожный danger
      width: 420,
      height: 520,
      rotation: -24,
      top: 40,
      left: 16,
      duration: 16,
      color: 'hsl(var(--heroui-danger-300)/0.6)',
    } as circleParams,

    {
      // Правый край — vertical secondary
      width: 540,
      height: 840,
      rotation: -16,
      top: 22,
      left: 84,
      duration: 28,
      color: 'hsl(var(--heroui-secondary-500)/0.65)',
    } as circleParams,
    {
      // Справа ближе к центру — secondary поменьше
      width: 460,
      height: 520,
      rotation: 22,
      top: 46,
      left: 60,
      duration: 18,
      color: 'hsl(var(--heroui-secondary-400)/0.8)',
    } as circleParams,

    // ===== LIGHT: НИЖНЯЯ ЧАСТЬ =====
    {
      // Левый низ — крупный primary
      width: 880,
      height: 500,
      rotation: 14,
      top: 82,
      left: -8,
      duration: 22,
      color: 'hsl(var(--heroui-primary-500)/0.8)',
    } as circleParams,
    {
      // Нижний центр — более светлый primary
      width: 820,
      height: 520,
      rotation: -10,
      top: 86,
      left: 26,
      duration: 20,
      color: 'hsl(var(--heroui-primary-300)/0.75)',
    } as circleParams,
    {
      // Правый низ — secondary
      width: 700,
      height: 480,
      rotation: 12,
      top: 80,
      left: 72,
      duration: 24,
      color: 'hsl(var(--heroui-secondary-500)/0.7)',
    } as circleParams,

    // Маленький warning — на краю, как лёгкое свечение
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
    // === DARK: крупная "рамка" максимально геометрически близка к light ===

    // ВЕРХ
    {
      // Левый верх — акцентный, примерно на тех же координатах
      width: 860,
      height: 480,
      rotation: -14,
      top: -10,
      left: -4,
      duration: 26,
      color: `${foggy_accent.light['500']}BF`, // ~75%
    } as circleParams,
    {
      // Верхний центр — ближе к primary, чуть меньше
      width: 820,
      height: 440,
      rotation: 6,
      top: -8,
      left: 20,
      duration: 30,
      color: 'hsl(var(--heroui-primary-300)/0.7)',
    } as circleParams,
    {
      // Правый верх — тёмный accent
      width: 640,
      height: 400,
      rotation: -10,
      top: -10,
      left: 76,
      duration: 28,
      color: `${foggy_accent.light['600']}B3`,
    } as circleParams,

    // БОКА
    {
      // Левый край
      width: 500,
      height: 780,
      rotation: 18,
      top: 20,
      left: -12,
      duration: 32,
      color: `${foggy_accent.light['500']}80`,
    } as circleParams,
    {
      // Правый край
      width: 520,
      height: 820,
      rotation: -18,
      top: 22,
      left: 84,
      duration: 34,
      color: `${foggy_accent.light['600']}80`,
    } as circleParams,

    // НИЗ
    {
      // Левый низ — крупный accent
      width: 860,
      height: 480,
      rotation: 14,
      top: 80,
      left: -8,
      duration: 30,
      color: `${foggy_accent.light['500']}B3`,
    } as circleParams,
    {
      // Нижний центр — мягкий accent+primary
      width: 820,
      height: 500,
      rotation: -10,
      top: 84,
      left: 24,
      duration: 26,
      color: `${foggy_accent.light['400']}99`,
    } as circleParams,
    {
      // Правый низ — тёмный accent
      width: 700,
      height: 460,
      rotation: 12,
      top: 80,
      left: 72,
      duration: 32,
      color: `${foggy_accent.light['600']}99`,
    } as circleParams,

    // === DARK: внутренние "огоньки", порядок — поверх рамки ===

    {
      // Secondary в верхнем центре — чуть крупнее, чтобы не терялся
      width: 460,
      height: 460,
      rotation: 16,
      top: 4,
      left: 40,
      duration: 20,
      color: 'hsl(var(--heroui-secondary-300)/0.6)',
    } as circleParams,

    {
      // Небольшой primary-подобный огонёк слева ближе к центру
      width: 340,
      height: 360,
      rotation: -18,
      top: 40,
      left: 22,
      duration: 22,
      color: 'hsl(var(--heroui-primary-200)/0.6)',
    } as circleParams,

    {
      // Danger внизу — ЧУТЬ МЕНЬШЕ, яркий, но компактный
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

const BackgroundGradient = () => {
  const { resolvedTheme } = useTheme();
  const currentCircles =
    circles[(resolvedTheme as 'light' | 'dark') ?? 'light'];

  return (
    <div
      className={clsx(
        'transition-background absolute top-0 left-0 -z-10 h-full w-full overflow-hidden',
        resolvedTheme === 'dark'
          ? 'bg-default-100 opacity-50'
          : 'bg-default-200',
      )}
    >
      {currentCircles.map((circle, index) => (
        <BackgroundCircle key={index} params={circle} />
      ))}
    </div>
  );
};

export default BackgroundGradient;

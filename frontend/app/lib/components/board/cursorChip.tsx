import { Chip } from '@heroui/chip';
import { MousePointer2Icon } from 'lucide-react';
import { ReactNode } from 'react';
import {
  danger,
  foggy_accent,
  info,
  primary,
  secondary,
  success,
  warning,
} from '@/tailwind.config';
import { useTheme } from 'next-themes';

export type CursorColor =
  | 'danger'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'info'
  | 'f_accent';

const cursorColorMap: Record<CursorColor, any> = {
  primary: primary,
  secondary: secondary,
  warning: warning,
  success: success,
  danger: danger,
  info: info,
  f_accent: foggy_accent,
};
export const cursorColors: CursorColor[] = Object.keys(
  cursorColorMap,
) as CursorColor[];

export default function CursorChip(
  props: {
    color: CursorColor;
    nickname: string;
  } & any,
) {
  const { theme } = useTheme();
  const color: string =
    cursorColorMap[props.color as CursorColor][theme as any].DEFAULT;
  return (
    <div {...props} className="pointer-events-none fixed top-0 left-0 z-40">
      <Chip
        style={{ color }}
        variant="light"
        className="pointer-events-none flex h-fit items-center"
        classNames={{
          base: 'gap-0 p-0 m-0',
          content: 'font-semibold p-0',
        }}
        startContent={
          (
            <MousePointer2Icon
              stroke={color}
              className={`relative -top-1 -left-0.5`}
            />
          ) as ReactNode
        }
      >
        {props.nickname}
      </Chip>
    </div>
  );
}

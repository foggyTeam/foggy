import { Chip } from '@heroui/chip';
import { MousePointer2Icon } from 'lucide-react';
import { ReactNode } from 'react';

export type CursorColor =
  | 'danger'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'f_accent'
  | undefined;

export const cursorColors: CursorColor[] = [
  'primary',
  'secondary',
  'warning',
  'success',
  'danger',
  'f_accent',
];

export default function CursorChip(
  props: {
    color: CursorColor;
    nickname: string;
  } & any,
) {
  return (
    <div {...props} className="pointer-events-none fixed top-0 left-0 z-40">
      <Chip
        variant="light"
        color={props.color}
        className="pointer-events-none flex h-fit items-center"
        classNames={{
          base: 'gap-0 p-0 m-0',
          content: 'font-semibold p-0',
        }}
        startContent={
          (
            <MousePointer2Icon
              className={`relative -top-1 -left-0.5 stroke-${props.color}-500`}
            />
          ) as ReactNode
        }
      >
        {props.nickname}
      </Chip>
    </div>
  );
}

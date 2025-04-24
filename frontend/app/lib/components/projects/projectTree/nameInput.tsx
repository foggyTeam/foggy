import clsx from 'clsx';
import { Input } from '@heroui/input';

export default function NameInput({
  isReadonly,
  setIsReadonly,
  onBlur,
  value,
  onValueChange,
  size = 'sm',
  maxW = 'sm',
}: {
  isReadonly: boolean;
  setIsReadonly: any;
  onBlur: any;
  value: string;
  onValueChange: any;
  size?: 'sm' | 'md' | 'lg';
  maxW?: 'sm' | 'md' | 'lg';
}) {
  return (
    <Input
      isReadOnly={isReadonly}
      autoFocus={!isReadonly}
      onClick={(e) => e.stopPropagation()}
      onFocus={() => setIsReadonly(false)}
      onBlur={onBlur}
      value={value}
      onValueChange={onValueChange}
      variant="bordered"
      size={size}
      className={clsx(
        'h-6 w-fit content-center rounded-lg border-1.5 border-default/0',
        !isReadonly && 'border-default-200',
      )}
      classNames={{
        main: 'h-6',
        mainWrapper: 'flex justify-center',
        inputWrapper: `shadow-none max-w-${maxW} transition-all border-none`,
        input: 'truncate text-nowrap',
      }}
    />
  );
}

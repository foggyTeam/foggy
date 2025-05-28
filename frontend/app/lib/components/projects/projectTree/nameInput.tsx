import clsx from 'clsx';
import { Input } from '@heroui/input';
import { useEffect, useState } from 'react';
import IsFormValid from '@/app/lib/utils/isFormValid';
import { projectElementNameSchema } from '@/app/lib/types/schemas';

export default function NameInput({
  isReadonly,
  setIsReadonly,
  onBlur,
  value,
  onValueChange,
  upperCase = false,
  size = 'sm',
  maxW = 'sm',
}: {
  isReadonly: boolean;
  setIsReadonly: any;
  onBlur: (newValue: string) => void;
  value: string;
  onValueChange: any;
  upperCase?: boolean;
  size?: 'sm' | 'md' | 'lg';
  maxW?: 'sm' | 'md' | 'lg';
}) {
  const [error, setError] = useState({});
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    IsFormValid({ name: localValue }, projectElementNameSchema, setError);
  }, [localValue, setError]);
  const handleBlur = () => {
    if (Object.keys(error).length < 1) onValueChange(localValue);
    else setLocalValue(value);
    onBlur(localValue);
  };

  return (
    <Input
      isReadOnly={isReadonly}
      autoFocus={!isReadonly}
      onClick={(e) => e.stopPropagation()}
      onFocus={() => setIsReadonly(false)}
      onBlur={handleBlur}
      value={upperCase ? localValue.toUpperCase() : localValue}
      onValueChange={setLocalValue}
      variant="bordered"
      size={size}
      className={clsx(
        'h-6 w-fit content-center rounded-lg border-1.5 border-default/0',
        !isReadonly &&
          ('name' in error ? 'border-danger-400' : 'border-default-200'),
      )}
      classNames={{
        base: 'h-6',
        mainWrapper: 'flex justify-center',
        inputWrapper: `shadow-none max-w-${maxW} transition-all border-none`,
        input: 'truncate text-nowrap',
      }}
    />
  );
}

import clsx from 'clsx';
import { el_animation } from '@/app/lib/types/styles';
import { Button } from '@heroui/button';
import { PlusIcon } from 'lucide-react';

export default function AddRootSectionButton({
  title,
  onPress,
}: {
  title: string;
  onPress: any;
}) {
  return (
    <Button
      onPress={() => onPress([])}
      className={clsx(
        'flex items-center justify-start rounded-2xl',
        'w-full bg-white/50 px-3 py-2 shadow-container hover:bg-default-50/50',
        'h-14 gap-2 transition-all duration-500',
        el_animation,
      )}
    >
      <PlusIcon className="m-2 stroke-default-500" />

      <p>{title}...</p>
    </Button>
  );
}

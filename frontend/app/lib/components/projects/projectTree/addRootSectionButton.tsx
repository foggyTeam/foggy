import clsx from 'clsx';
import { el_animation } from '@/app/lib/types/styles';
import { Button } from '@heroui/button';
import { PlusIcon } from 'lucide-react';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

export default function AddRootSectionButton({
  title,
  onPress,
}: {
  title: string;
  onPress: any;
}) {
  const { commonSize } = useAdaptiveParams();
  return (
    <Button
      size={commonSize}
      onPress={() => onPress([])}
      className={clsx(
        'flex items-center justify-start rounded-2xl',
        'hover:bg-default-50/50 shadow-container w-full bg-[hsl(var(--heroui-background))]/50 px-3 py-2',
        'h-14 gap-2 transition-all duration-500',
        el_animation,
      )}
    >
      <PlusIcon className="stroke-default-600 m-2" />

      <p>{title}...</p>
    </Button>
  );
}

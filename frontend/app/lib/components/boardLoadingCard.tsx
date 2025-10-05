'use client';

import { observer } from 'mobx-react-lite';
import FoggyLarge from '@/app/lib/components/svg/foggyLarge';
import { Progress } from '@heroui/progress';

const BoardLoadingCard = observer(() => {
  return (
    <div className="flex h-fit w-full flex-col items-center justify-center gap-2">
      <FoggyLarge
        width={320}
        height={240}
        alt={'foggy logo'}
        className="fill-primary stroke-primary stroke-0 transition-all duration-300 hover:fill-[url(#logo-gradient)] hover:stroke-2"
      />
      <Progress
        size="sm"
        classNames={{
          indicator: 'bg-linear-to-r from-primary-500 to-danger-400',
        }}
        isIndeterminate
        aria-label="Loading..."
        className="w-full"
      />
    </div>
  );
});

export default BoardLoadingCard;

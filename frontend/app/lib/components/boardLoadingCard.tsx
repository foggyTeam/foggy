'use client';

import { observer } from 'mobx-react-lite';
import { Progress } from '@heroui/progress';
import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
import FoggySmall from '@/app/lib/components/svg/foggySmall';
import settingsStore from '@/app/stores/settingsStore';

const BoardLoadingCard = observer(() => {
  return (
    settingsStore.isLoading && (
      <div className="bg-default-900/10 absolute top-0 left-0 z-30 flex h-screen w-screen items-center justify-center backdrop-blur-xl">
        <div
          className={clsx(
            'flex h-fit w-full max-w-sm flex-col items-center justify-center gap-4',
            bg_container,
            'px-12',
          )}
        >
          <div className="flex h-fit w-full flex-col items-center justify-center gap-4">
            <FoggySmall
              width={128}
              height={128}
              alt={'foggy logo'}
              className="stroke-primary fill-[url(#logo-gradient)] stroke-0 transition-all duration-300"
            />
            <Progress
              size="md"
              classNames={{
                indicator: 'bg-linear-to-r from-primary-500 to-danger-400',
              }}
              isIndeterminate
              aria-label="Loading..."
              className="w-full"
            />
          </div>
        </div>
      </div>
    )
  );
});

export default BoardLoadingCard;

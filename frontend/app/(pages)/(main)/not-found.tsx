import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import React from 'react';
import NotFound from '@/app/lib/components/not-found';

export default function NotFoundPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-8 px-24 py-8">
      <div
        className={clsx(
          'flex h-fit w-fit flex-col items-center justify-center',
          bg_container_no_padding,
          'px-8 pt-8',
        )}
      >
        <NotFound />
      </div>
    </div>
  );
}

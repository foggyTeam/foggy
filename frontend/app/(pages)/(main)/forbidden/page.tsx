import { bg_container_no_padding } from '@/app/lib/types/styles';
import React from 'react';
import ForbiddenState from '@/app/lib/components/forbiddenState';
import clsx from 'clsx';

export default function ForbiddenPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-8 px-24 py-8">
      <div
        className={clsx(
          'flex h-fit w-full max-w-2xl flex-col items-center justify-center',
          bg_container_no_padding,
          'p-8',
        )}
      >
        <ForbiddenState />
      </div>
    </div>
  );
}

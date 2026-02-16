'use client';

import React, { useEffect } from 'react';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import EmptyState from '@/app/lib/components/emptyState';
import { useRouter } from 'next/navigation';
import settingsStore from '@/app/stores/settingsStore';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 px-24 py-8">
      <div
        className={clsx(
          'flex h-full w-full max-w-2xl flex-col items-center justify-center',
          bg_container_no_padding,
          'px-8 pt-8',
        )}
      >
        <EmptyState
          leftButton={{
            title: settingsStore.t.main.error.goToMain,
            callback: () => router.push('/'),
          }}
          rightButton={{
            title: settingsStore.t.main.error.retry,
            callback: reset,
          }}
          title={settingsStore.t.main.error.title}
          text={error.message}
          size="full"
          illustrationType={500}
        />
      </div>
    </div>
  );
}

'use client';

import { Skeleton } from '@heroui/skeleton';
import React from 'react';

export default function GenerationSkeleton({
  type,
}: {
  type: 'summarize' | 'structurize';
}) {
  return type === 'summarize' ? (
    <div className="flex w-full flex-col gap-4 py-2">
      <Skeleton className="h-6 w-2/5 rounded-lg" />

      <div className="flex w-full flex-col gap-2">
        <Skeleton className="h-5 w-full rounded-lg" />
        <Skeleton className="h-5 w-[95%] rounded-lg" />
        <Skeleton className="h-5 w-[98%] rounded-lg" />
        <Skeleton className="h-5 w-[75%] rounded-lg" />
      </div>

      <Skeleton className="h-6 w-2/6 rounded-lg" />

      <div className="flex w-full flex-col gap-2">
        <Skeleton className="h-5 w-[96%] rounded-lg" />
        <Skeleton className="h-5 w-[97%] rounded-lg" />
        <Skeleton className="h-5 w-[80%] rounded-lg" />
      </div>
    </div>
  ) : (
    <div className="flex w-full flex-col gap-3 py-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-md" />
        <Skeleton className="h-5 w-2/5 rounded-lg" />
      </div>
      <div className="ml-6 flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-md" />
        <Skeleton className="h-5 w-1/2 rounded-lg" />
      </div>
      <div className="ml-12 flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-md" />
        <Skeleton className="h-5 w-1/3 rounded-lg" />
      </div>
      <div className="ml-6 flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-md" />
        <Skeleton className="h-5 w-[45%] rounded-lg" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-md" />
        <Skeleton className="h-5 w-1/5 rounded-lg" />
      </div>
      <div className="ml-6 flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-md" />
        <Skeleton className="h-5 w-1/3 rounded-lg" />
      </div>
      <div className="ml-6 flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-md" />
        <Skeleton className="h-5 w-1/2 rounded-lg" />
      </div>
      <div className="ml-6 flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-md" />
        <Skeleton className="h-5 w-1/4 rounded-lg" />
      </div>
    </div>
  );
}

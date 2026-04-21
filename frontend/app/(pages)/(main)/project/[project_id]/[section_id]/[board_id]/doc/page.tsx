import DocBoardClientWrapper from '@/app/lib/components/board/doc/docBoardClientWrapper';
import React from 'react';

export default async function DocBoardPage() {
  return (
    <div className="flex h-full w-full flex-col items-start justify-start gap-4 px-8 py-8 pt-4 sm:px-24 sm:pt-8">
      <DocBoardClientWrapper />
    </div>
  );
}

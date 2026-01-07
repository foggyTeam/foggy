'use client';

import dynamic from 'next/dynamic';

const BackgroundGradient = dynamic(
  () => import('@/app/lib/components/backgroundGradient/backgroundGradient'),
  { ssr: false },
);

export default function BackgroundWrapper() {
  return <BackgroundGradient />;
}

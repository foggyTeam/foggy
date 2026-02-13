import React from 'react';
import clsx from 'clsx';
import MobileLayout from '@/app/lib/components/mobileLayout';

export default function AdaptiveContainer({
  children,
  mobileTabs,
  desktopContainerClassName,
}: Readonly<{
  children: React.ReactNode;
  mobileTabs: {
    key: string;
    titleKey: string;
  }[];
  desktopContainerClassName?: string;
}>) {
  return (
    <>
      <div className={clsx('hidden sm:flex', desktopContainerClassName)}>
        {children}
      </div>
      <div className="flex h-full max-h-screen w-full flex-col gap-2 p-4 pb-4 sm:hidden">
        <MobileLayout mobileTabs={mobileTabs}>{children}</MobileLayout>
      </div>
    </>
  );
}

'use client';

import React, { ReactElement, useMemo } from 'react';
import { Tab, Tabs } from '@heroui/tabs';

interface MobileTabsProps {
  key: string;
}

export default function AdaptiveContainer({
  children,
  mobileTabs,
}: Readonly<{
  children: React.ReactNode;
  mobileTabs: MobileTabsProps[];
}>) {
  const childMap = useMemo(() => {
    const map = new Map<string, ReactElement>();

    const childrenArray = children as any;

    const a = Array.isArray(childrenArray) ? childrenArray : [childrenArray];

    a.forEach((child: any) => {
      if (!child || typeof child !== 'object') return;

      const key = child.key as string | null;
      if (!key) return;

      const normalizedKey = key.startsWith('.$')
        ? key.slice(2)
        : key.replace(/^\./, '');
      map.set(normalizedKey, child);
    });

    return map;
  }, [children]);

  return (
    <>
      <section className="hidden sm:block">{children}</section>
      <div className="flex h-full w-full flex-col gap-2 pb-4 sm:hidden">
        <Tabs
          variant="bordered"
          color="primary"
          aria-label="Tabs"
          items={mobileTabs}
          classNames={{
            tabList: 'w-full rounded-xl',
            panel: 'p-0 h-full',
          }}
        >
          {(tab) => {
            return (
              <Tab key={tab.key} title={tab.key}>
                {childMap.get(tab.key)}
              </Tab>
            );
          }}
        </Tabs>
      </div>
    </>
  );
}

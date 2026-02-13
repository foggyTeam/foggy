'use client';

import React, { ReactElement, useMemo } from 'react';
import { Tab, Tabs } from '@heroui/tabs';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { observer } from 'mobx-react-lite';
import settingsStore from '@/app/stores/settingsStore';

const MobileLayout = observer(
  ({
    children,
    mobileTabs,
  }: Readonly<{
    children: React.ReactNode;
    mobileTabs: {
      key: string;
      titleKey: string;
    }[];
  }>) => {
    const { commonSize } = useAdaptiveParams();

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
      <Tabs
        size={commonSize}
        variant="bordered"
        color="primary"
        aria-label="Tabs"
        items={mobileTabs}
        classNames={{
          tabList: 'w-full rounded-xl',
          panel: 'p-0 min-h-0 flex-1 font-medium overflow-clip',
        }}
      >
        {(tab: { key: string; titleKey: string }) => {
          return (
            <Tab
              key={tab.key}
              title={
                settingsStore.t.main.mobileTitles[
                  tab.titleKey as keyof typeof settingsStore.t.main.mobileTitles
                ]
              }
            >
              {childMap.get(tab.key)}
            </Tab>
          );
        }}
      </Tabs>
    );
  },
);
export default MobileLayout;

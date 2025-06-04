'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import { GetUnreadNumber } from '@/app/lib/server/actions/notificationsServerActions';
import notificationsStore from '@/app/stores/notificationsStore';

const NotificationsLoader = () => {
  const { data: revalidatedNumber, error } = useSWR(
    'unreadNumber',
    () => GetUnreadNumber(),
    {
      revalidateOnFocus: true,
      refreshInterval: 150000, // 2 минуты
    },
  );

  useEffect(() => {
    if (revalidatedNumber && !error) {
      notificationsStore.setUnreadNumber(revalidatedNumber);
    } else
      addToast({
        color: 'danger',
        severity: 'danger',
        // TODO: update notifications error
        title: settingsStore.t.toasts.updateProjectsError,
      });
  }, [revalidatedNumber]);

  return null;
};

export default NotificationsLoader;

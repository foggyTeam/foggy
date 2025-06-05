'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import { GetUnreadNumber } from '@/app/lib/server/actions/notificationsServerActions';
import notificationsStore from '@/app/stores/notificationsStore';
import { observer } from 'mobx-react-lite';

const NotificationsLoader = observer(() => {
  const {
    data: { notificationCount },
    error,
  } = useSWR('unreadNumber', () => GetUnreadNumber(), {
    fallbackData: notificationsStore.unreadNumber,
    revalidateOnFocus: true,
    refreshInterval: 150000, // 2 минуты
  });

  useEffect(() => {
    if (notificationCount && !error) {
      notificationsStore.setUnreadNumber(notificationCount);
    } else if (error)
      addToast({
        color: 'warning',
        severity: 'warning',
        title:
          settingsStore.t.toasts.notifications.updateNotificationsNumberError,
      });
  }, [notificationCount]);

  return null;
});

export default NotificationsLoader;

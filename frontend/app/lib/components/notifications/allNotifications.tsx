'use client';
import { observer } from 'mobx-react-lite';
import ContentSection from '@/app/lib/components/contentSection';
import notificationsStore from '@/app/stores/notificationsStore';
import { createContext, useEffect } from 'react';
import { GetAllNotifications } from '@/app/lib/server/actions/notificationsServerActions';
import { addToast } from '@heroui/toast';
import NotificationCard from '@/app/lib/components/notifications/notificationCard';
import useSWR from 'swr';
import { Role } from '@/app/lib/types/definitions';

export interface NotificationsContextType {
  onAnswer: (
    notificationId: string,
    accept: boolean,
    role?: Omit<Role, 'owner'>,
  ) => void;
  onDelete: (notificationId: string) => void;
}
export const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

const AllNotifications = observer(() => {
  const {
    data: revalidatedData,
    isLoading,
    error,
  } = useSWR('notificationsData', () => GetAllNotifications(), {
    revalidateOnFocus: true,
    refreshInterval: 150000, // 2 минуты
  });

  useEffect(() => {
    console.log(revalidatedData);
    if (revalidatedData && !error) {
      notificationsStore.setNotifications(revalidatedData);
    } else if (error)
      addToast({ severity: 'danger', color: 'danger', title: '' });
  }, [revalidatedData]);

  const onAnswer = async (
    notificationId: string,
    accept: boolean,
    role?: Role,
  ) => {
    console.log((accept && 'accept') || 'discard');
  };

  const onDelete = async (notificationId: string) => {
    console.log('delete');
  };

  return (
    <div className="w-72">
      <NotificationsContext.Provider value={{ onAnswer, onDelete }}>
        <ContentSection
          data={notificationsStore.notifications.slice()}
          DataCard={NotificationCard}
          filter
        />
      </NotificationsContext.Provider>
    </div>
  );
});

export default AllNotifications;

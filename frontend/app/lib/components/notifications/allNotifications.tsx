'use client';
import { observer } from 'mobx-react-lite';
import ContentSection from '@/app/lib/components/contentSection';
import notificationsStore from '@/app/stores/notificationsStore';
import { createContext, useEffect } from 'react';
import {
  AnswerNotification,
  DeleteNotification,
  GetAllNotifications,
} from '@/app/lib/server/actions/notificationsServerActions';
import { addToast } from '@heroui/toast';
import NotificationCard from '@/app/lib/components/notifications/notificationCard';
import useSWR from 'swr';
import { NotificationType, Role } from '@/app/lib/types/definitions';
import settingsStore from '@/app/stores/settingsStore';

export interface NotificationsContextType {
  onAnswer: (
    notificationId: string,
    notificationType: NotificationType,
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

    error,
  } = useSWR('notificationsData', () => GetAllNotifications(), {
    revalidateOnFocus: true,
    refreshInterval: 150000, // 2 минуты
  });

  useEffect(() => {
    if (revalidatedData && !error) {
      notificationsStore.setNotifications(revalidatedData);
    } else if (error)
      addToast({
        severity: 'danger',
        color: 'danger',
        title: settingsStore.t.toasts.notifications.updateNotificationsError,
      });
  }, [revalidatedData]);

  const onAnswer = async (
    notificationId: string,
    notificationType: NotificationType,
    accept: boolean,
    role?: Role,
  ) => {
    await AnswerNotification(notificationId, accept)
      .then(() => {
        // TODO: process {errors: }
        switch (notificationType) {
          case 'PROJECT_JOIN_REQUEST':
            notificationsStore.changeNotificationType(
              notificationId,
              accept ? 'PROJECT_JOIN_ACCEPTED' : 'PROJECT_JOIN_REJECTED',
            );
            break;
          case 'TEAM_JOIN_REQUEST':
            notificationsStore.changeNotificationType(
              notificationId,
              accept ? 'TEAM_JOIN_ACCEPTED' : 'TEAM_JOIN_REJECTED',
            );
            break;
          case 'PROJECT_INVITE':
            notificationsStore.changeNotificationType(
              notificationId,
              accept ? 'PROJECT_JOIN_ACCEPTED' : 'PROJECT_JOIN_REJECTED',
            );
            break;
          case 'TEAM_INVITE':
            notificationsStore.changeNotificationType(
              notificationId,
              accept ? 'TEAM_JOIN_ACCEPTED' : 'TEAM_JOIN_REJECTED',
            );
            break;
        }
      })
      .catch(() =>
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.globalError,
        }),
      );
  };

  const onDelete = async (notificationId: string) => {
    await DeleteNotification(notificationId)
      .then(() => notificationsStore.deleteNotification(notificationId))
      .catch(() =>
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.globalError,
        }),
      );
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

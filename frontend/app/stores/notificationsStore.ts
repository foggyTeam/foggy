import { action, makeAutoObservable, observable } from 'mobx';
import { Notification, NotificationType } from '@/app/lib/types/definitions';
import { addToast } from '@heroui/toast';

class NotificationsStore {
  notifications: Notification[] = [];
  unreadNumber: number = 0;

  constructor() {
    makeAutoObservable(this, {
      notifications: observable,
      unreadNumber: observable,
      setUnreadNumber: action,
      setNotifications: action,
      changeNotificationType: action,
      deleteNotification: action,
    });
  }

  setUnreadNumber = (n: number) => {
    this.unreadNumber = n;
  };
  setNotifications = (notifications: Notification[]) => {
    this.notifications = [...notifications];
  };
  changeNotificationType = (id: string, newType: NotificationType) => {
    const index = this.notifications.findIndex(
      (notification) => notification.id === id,
    );
    if (id < 0) {
      addToast({ severity: 'danger', color: 'danger', title: 'failed' });
      return;
    }
    this.notifications[index].type = newType;
  };
  deleteNotification = (id: string) => {
    this.notifications = [
      ...this.notifications.filter((notification) => notification.id === id),
    ];
  };
}

const notificationsStore = new NotificationsStore();
export default notificationsStore;

import { Notification, Role } from '@/app/lib/types/definitions';
import {
  NotificationsContext,
  NotificationsContextType,
} from '@/app/lib/components/notifications/allNotifications';
import React, { useContext } from 'react';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal';
import settingsStore from '@/app/stores/settingsStore';
import NotificationMainText from '@/app/lib/components/notifications/notificationMainText';
import RequestMessageCard from '@/app/lib/components/notifications/requestMessageCard';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';
import { Avatar } from '@heroui/avatar';
import SelectRole from '@/app/lib/components/members/selectRole';

export default function NotificationCardModal({
  notification,
  role,
  setRole,
  isOpen,
  onOpenChange,
}: {
  notification: Notification;
  role: Role | undefined;
  setRole: (value: Role | undefined | ((prevState: Role) => Role)) => void;
  isOpen: boolean;
  onOpenChange: () => void;
}) {
  const { onAnswer }: NotificationsContextType =
    useContext(NotificationsContext);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
      <ModalContent className="flex w-full max-w-lg gap-2 p-6">
        {() => (
          <>
            <ModalHeader className="flex p-0">
              <div className="flex items-center justify-start gap-2">
                <Avatar
                  name={notification.target.name}
                  src={notification.target.avatar}
                />
                {notification.target.name.toUpperCase()}
              </div>
            </ModalHeader>
            <ModalBody className="flex h-fit w-full max-w-lg flex-col flex-wrap gap-4 p-0">
              <div className="flex h-fit w-full flex-col gap-2">
                <NotificationMainText {...notification} />
                <RequestMessageCard
                  nickname={notification.initiator.nickname}
                  avatar={notification.initiator.avatar}
                  message={notification.metadata.customMessage}
                />

                {['PROJECT_MEMBER_ADDED', 'TEAM_MEMBER_ADDED'].findIndex(
                  (key) => key == notification.type.toString(),
                ) < 0 && (
                  <>
                    <SelectRole
                      role={role}
                      setRole={setRole}
                      disallowEmptySelection={true}
                      isDisabled={
                        ['PROJECT_JOIN_REQUEST'].findIndex(
                          (key) => key == notification.type.toString(),
                        ) < 0
                      }
                      style="bordered"
                    />
                  </>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex w-full justify-between gap-4 p-0 pt-2">
              {['PROJECT_MEMBER_ADDED', 'TEAM_MEMBER_ADDED'].findIndex(
                (key) => key == notification.type.toString(),
              ) < 0 && (
                <div className="flex w-full items-center justify-between gap-4">
                  <FButton
                    isDisabled={
                      [
                        'PROJECT_JOIN_ACCEPTED',
                        'PROJECT_JOIN_REJECTED',
                        'TEAM_JOIN_ACCEPTED',
                        'TEAM_JOIN_REJECTED',
                      ].findIndex(
                        (key) => key == notification.type.toString(),
                      ) >= 0
                    }
                    onPress={() =>
                      onAnswer(notification.id, notification.type, false)
                    }
                    size="md"
                    variant="bordered"
                    color="danger"
                  >
                    {['PROJECT_JOIN_REJECTED', 'TEAM_JOIN_REJECTED'].findIndex(
                      (key) => key == notification.type.toString(),
                    ) >= 0
                      ? settingsStore.t.notifications.answers.rejected
                      : settingsStore.t.notifications.answers.reject}
                  </FButton>
                  <FButton
                    isDisabled={
                      [
                        'PROJECT_JOIN_ACCEPTED',
                        'PROJECT_JOIN_REJECTED',
                        'TEAM_JOIN_ACCEPTED',
                        'TEAM_JOIN_REJECTED',
                      ].findIndex(
                        (key) => key == notification.type.toString(),
                      ) >= 0 || !role
                    }
                    onPress={() =>
                      onAnswer(notification.id, notification.type, true, role)
                    }
                    size="md"
                    variant="flat"
                    color="success"
                  >
                    {['PROJECT_JOIN_ACCEPTED', 'TEAM_JOIN_ACCEPTED'].findIndex(
                      (key) => key == notification.type.toString(),
                    ) >= 0
                      ? settingsStore.t.notifications.answers.accepted
                      : settingsStore.t.notifications.answers.accept}
                  </FButton>
                </div>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

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
import { Select, SelectItem } from '@heroui/select';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import RoleCard, { rolesList } from '@/app/lib/components/members/roleCard';
import NotificationMainText from '@/app/lib/components/notifications/notificationMainText';
import RequestMessageCard from '@/app/lib/components/notifications/requestMessageCard';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';
import { Avatar } from '@heroui/avatar';

export default function NotificationCardModal({
  notification,
  role,
  setRole,
  isOpen,
  onOpenChange,
}: {
  notification: Notification;
  role: Omit<Role, 'owner'>[];
  setRole: (newRole: Omit<Role, 'owner'>[]) => void;
  isOpen: boolean;
  onOpenChange: () => void;
}) {
  const { onAnswer }: NotificationsContextType =
    useContext(NotificationsContext);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
      <ModalContent className="flex w-full max-w-lg gap-2 p-6">
        {(onClose) => (
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
                    <Select
                      isDisabled={
                        ['PROJECT_JOIN_REQUEST'].findIndex(
                          (key) => key == notification.type.toString(),
                        ) < 0
                      }
                      radius="full"
                      className="w-full"
                      variant="bordered"
                      size="sm"
                      classNames={{
                        popoverContent: clsx(
                          bg_container_no_padding,
                          'p-2 sm:p-3 bg-opacity-100',
                        ),
                      }}
                      selectedKeys={role}
                      onSelectionChange={(keys) =>
                        setRole(Array.from(keys) as Role[])
                      }
                      placeholder={
                        settingsStore.t.members.addMember.rolePlaceholder
                      }
                      aria-label="select-role"
                      renderValue={(items) => {
                        return (
                          <div className="flex gap-1 overflow-hidden">
                            {items.map((item) => (
                              <RoleCard
                                key={item.key}
                                role={item.key as string}
                              />
                            ))}
                          </div>
                        );
                      }}
                    >
                      {rolesList
                        .filter((role) => role !== 'owner')
                        .map(
                          (role) =>
                            (
                              <SelectItem key={role} textValue={role}>
                                <RoleCard role={role} />
                              </SelectItem>
                            ) as any,
                        )}
                    </Select>
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
                      ) >= 0 || !role.length
                    }
                    onPress={() =>
                      onAnswer(
                        notification.id,
                        notification.type,
                        true,
                        role[0],
                      )
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

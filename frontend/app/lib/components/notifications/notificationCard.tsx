import { Notification, Role } from '@/app/lib/types/definitions';
import clsx from 'clsx';
import {
  bg_container_no_padding,
  el_animation,
  notification_tile,
  notification_tile_exp,
} from '@/app/lib/types/styles';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Avatar } from '@heroui/avatar';
import { Button } from '@heroui/button';
import { TrashIcon } from 'lucide-react';
import GetDateTime from '@/app/lib/utils/getDateTime';
import RequestMessageCard from '@/app/lib/components/notifications/requestMessageCard';
import {
  NotificationsContext,
  NotificationsContextType,
} from '@/app/lib/components/notifications/allNotifications';
import { Select, SelectItem } from '@heroui/select';
import settingsStore from '@/app/stores/settingsStore';
import RoleCard, { rolesList } from '@/app/lib/components/members/roleCard';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';
import NotificationMainText from '@/app/lib/components/notifications/notificationMainText';
import { useDisclosure } from '@heroui/modal';
import NotificationCardModal from '@/app/lib/components/notifications/notificationCardModal';

export default function NotificationCard(notification: Notification) {
  const { onAnswer, onDelete }: NotificationsContextType =
    useContext(NotificationsContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [role, setRole] = useState<Omit<Role, 'owner'>[]>([
    notification.metadata.role,
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        event.stopPropagation();
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getTitle = () => {
    function chooseTitle() {
      switch (notification.target.type) {
        case 'TEAM':
          return settingsStore.t.notifications.titleType.team;
        case 'PROJECT':
          return settingsStore.t.notifications.titleType.project;
      }
    }

    return chooseTitle().replace('_', notification.target.name.toUpperCase());
  };

  return (
    <>
      <div
        ref={cardRef}
        onClick={(event) => {
          event.stopPropagation();
          setIsExpanded(true);
        }}
        className={clsx(
          'py-auto box-border flex w-[98%] max-w-72 flex-col items-center justify-between gap-1 rounded-2xl bg-white px-2 shadow-container',
          el_animation,
          isExpanded ? 'h-fit py-2' : 'h-8 cursor-pointer',
          isExpanded ? notification_tile_exp : notification_tile,
        )}
      >
        <div className="flex h-fit w-full items-center justify-between gap-2">
          <div className="flex h-full w-full items-center justify-start gap-1">
            <Avatar
              classNames={{
                base: 'h-7 w-7 border-white border-2',
              }}
              src={notification.target.avatar}
              name={notification.target.name}
            />
            <h1 className="w-fit max-w-24 truncate text-nowrap font-medium">
              {getTitle()}
            </h1>
          </div>
          <div className="flex h-full w-fit items-center justify-start gap-1">
            <p className="w-fit text-nowrap text-end text-xs text-default-700">
              {GetDateTime(notification.createdAt)}
            </p>
            <Button
              isIconOnly
              onPress={() => onDelete(notification.id)}
              variant="light"
              color="danger"
              radius="full"
              size="sm"
            >
              <TrashIcon className="stroke-default-300 transition-colors hover:stroke-danger" />
            </Button>
          </div>
        </div>
        {isExpanded && (
          <div className="flex h-fit w-full flex-col gap-2">
            <NotificationMainText {...notification} />
            {notification.metadata.customMessage && (
              <RequestMessageCard
                onExpand={onOpen}
                nickname={notification.initiator.nickname}
                avatar={notification.initiator.avatar}
                message={notification.metadata.customMessage}
              />
            )}
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
                          <RoleCard key={item.key} role={item.key as string} />
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
                      variant="bordered"
                      color="danger"
                      size="sm"
                      className="text-small"
                      radius="full"
                    >
                      {[
                        'PROJECT_JOIN_REJECTED',
                        'TEAM_JOIN_REJECTED',
                      ].findIndex(
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
                      variant="flat"
                      color="success"
                      size="sm"
                      className="text-small"
                      radius="full"
                    >
                      {[
                        'PROJECT_JOIN_ACCEPTED',
                        'TEAM_JOIN_ACCEPTED',
                      ].findIndex(
                        (key) => key == notification.type.toString(),
                      ) >= 0
                        ? settingsStore.t.notifications.answers.accepted
                        : settingsStore.t.notifications.answers.accept}
                    </FButton>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      <NotificationCardModal
        notification={notification}
        role={role}
        setRole={setRole}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
    </>
  );
}

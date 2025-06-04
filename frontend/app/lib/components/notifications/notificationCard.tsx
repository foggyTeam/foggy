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

export default function NotificationCard(notification: Notification) {
  const { onAnswer, onDelete }: NotificationsContextType =
    useContext(NotificationsContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

  return (
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
            {/*TODO: text based on notif content*/}
            {notification.target.name}
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
          <p className="h-fit w-full text-start text-default-700">
            {notification.initiator.nickname} wants you to join her project{' '}
            {notification.target.name.toUpperCase()} as editor. Accept?
            {/*TODO: notification text*/}
          </p>
          <RequestMessageCard
            onExpand={() => console.log('expand')}
            nickname={notification.initiator.nickname}
            avatar={notification.initiator.avatar}
            message={notification.metadata.customMessage}
          />
          <Select
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
            onSelectionChange={(keys) => setRole(Array.from(keys) as Role[])}
            placeholder={settingsStore.t.members.addMember.rolePlaceholder}
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
          <div className="flex w-full items-center justify-between gap-4">
            <FButton
              onPress={() => onAnswer(notification.id, false)}
              variant="bordered"
              color="danger"
              size="sm"
              className="text-small"
              radius="full"
            >
              Decline
            </FButton>
            <FButton
              onPress={() => onAnswer(notification.id, true, role[0])}
              isDisabled={!role.length}
              variant="flat"
              color="success"
              size="sm"
              className="text-small"
              radius="full"
            >
              Accept
            </FButton>
          </div>
        </div>
      )}
    </div>
  );
}

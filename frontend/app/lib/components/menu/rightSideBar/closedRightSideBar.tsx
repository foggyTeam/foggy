'use client';
import { Avatar } from '@heroui/avatar';
import { Badge } from '@heroui/badge';
import { observer } from 'mobx-react-lite';
import userStore from '@/app/stores/userStore';
import { BellIcon, User2Icon } from 'lucide-react';
import { Button } from '@heroui/button';
import { bg_container, right_sidebar_layout } from '@/app/lib/types/styles';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import notificationsStore from '@/app/stores/notificationsStore';

const ClosedRightSideBar = observer(
  ({
    setActiveTab,
    openSideBar,
  }: {
    setActiveTab: (newTab: 'projects' | 'teams' | 'notifications') => void;
    openSideBar: () => void;
  }) => {
    const router = useRouter();
    return (
      <div
        onClick={openSideBar}
        className={clsx(
          bg_container,
          right_sidebar_layout,
          'flex flex-col items-center justify-center gap-4',
          'transform transition-all hover:bg-opacity-65 hover:pr-2',
        )}
      >
        <Button
          onPress={() => {
            router.push('/profile');
          }}
          className="h-fit w-fit min-w-fit rounded-full border-none p-0"
          variant="bordered"
        >
          <Avatar
            showFallback
            icon={<User2Icon className="h-64 w-64 stroke-default-200" />}
            name={userStore.user?.name || undefined}
            src={userStore.user?.image || undefined}
            size="lg"
            color="default"
          />
        </Button>
        <Badge
          showOutline={false}
          isInvisible={!notificationsStore.unreadNumber}
          size="sm"
          color="success"
          content={
            notificationsStore.unreadNumber < 100
              ? notificationsStore.unreadNumber
              : '99+'
          }
          variant="flat"
          shape="circle"
        >
          <Button
            onPress={() => {
              setActiveTab('notifications');
              openSideBar();
            }}
            isIconOnly
            variant="light"
            size="md"
          >
            <BellIcon className="stroke-default-500" />
          </Button>
        </Badge>
      </div>
    );
  },
);

export default ClosedRightSideBar;

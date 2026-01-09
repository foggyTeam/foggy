'use client';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import Link from 'next/link';
import FoggySmall from '@/app/lib/components/svg/foggySmall';
import { Button } from '@heroui/button';
import { Avatar } from '@heroui/avatar';
import { BellIcon, User2Icon } from 'lucide-react';
import userStore from '@/app/stores/userStore';
import { useRouter } from 'next/navigation';
import { Badge } from '@heroui/badge';
import notificationsStore from '@/app/stores/notificationsStore';
import React, { useEffect, useState } from 'react';
import { Navbar, NavbarMenu, NavbarMenuToggle } from '@heroui/navbar';
import OpenedRightSideBarContent from '@/app/lib/components/menu/rightSideBar/openedRightSideBarContent';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

export default function NavBar() {
  const router = useRouter();
  const { buttonSize, badgeSize } = useAdaptiveParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'projects' | 'teams' | 'notifications'
  >('projects');

  useEffect(() => {
    if (!isMenuOpen) setActiveTab('projects');
  }, [isMenuOpen]);

  return (
    <Navbar
      height={48}
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className={clsx(
        bg_container_no_padding,
        'border-x-none rounded-t-none rounded-b-none border-t-0 px-4 py-3',
      )}
    >
      <div className="flex h-12 w-fit items-center gap-6">
        <NavbarMenuToggle />

        <Link href="/">
          <FoggySmall height={40} width={40} className="fill-primary" />
        </Link>
      </div>

      <div className="flex h-12 w-fit items-center gap-2">
        <Badge
          showOutline={false}
          isInvisible={!notificationsStore.unreadNumber}
          size={badgeSize}
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
              setIsMenuOpen(true);
            }}
            isIconOnly
            variant="light"
            size={buttonSize}
          >
            <BellIcon className="stroke-default-500" />
          </Button>
        </Badge>

        <Button
          onPress={() => {
            router.push('/profile');
          }}
          className="h-fit w-fit min-w-fit rounded-full border-none p-0"
          variant="bordered"
        >
          <Avatar
            showFallback
            icon={<User2Icon className="stroke-default-200 h-64 w-64" />}
            name={userStore.user?.name || undefined}
            src={userStore.user?.image || undefined}
            className="h-12 w-12"
            color="default"
          />
        </Button>
      </div>

      <NavbarMenu>
        <div className="py-8">
          <OpenedRightSideBarContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </NavbarMenu>
    </Navbar>
  );
}

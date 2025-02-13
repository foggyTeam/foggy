'use client';
import { Avatar } from '@heroui/avatar';
import { Badge } from '@heroui/badge';
import { observer } from 'mobx-react-lite';
import userStore from '@/app/stores/userStore';
import { BellIcon, ChevronLeft, User2Icon } from 'lucide-react';
import { Button } from '@heroui/button';
import menuStore from '@/app/stores/menuStore';
import { bg_container } from '@/app/lib/types/style_definitions';
import clsx from 'clsx';

const ClosedSideBar = observer((props: { sideBarLayout: string }) => {
  return (
    <div
      className={clsx(
        bg_container,
        props['sideBarLayout'],
        'flex flex-col items-center justify-center gap-4',
      )}
    >
      <Button
        onPress={menuStore.toggleRightMenu}
        isIconOnly
        variant="bordered"
        color="secondary"
        size="sm"
        className="absolute -left-8 -mt-12 border-none"
      >
        <ChevronLeft className="stroke-default-400" />
      </Button>

      <Avatar
        showFallback
        icon={<User2Icon className="h-64 w-64 stroke-default-200" />}
        name={userStore.user?.name as string}
        src={userStore.user?.image as string}
        size="lg"
        color="default"
      />
      <Badge color="success" content={15} variant="flat">
        <Button
          onPress={() => {
            menuStore.setActiveTab('2');
            menuStore.toggleRightMenu();
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
});

export default ClosedSideBar;

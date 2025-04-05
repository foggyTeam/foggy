'use client';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Tab,
} from '@heroui/react';
import menuStore from '@/app/stores/menuStore';
import { Tabs } from '@heroui/tabs';
import { observer } from 'mobx-react-lite';
import { bg_container } from '@/app/lib/types/style_definitions';
import clsx from 'clsx';
import { ChevronRight, User2Icon, UserCog2Icon } from 'lucide-react';
import { Button } from '@heroui/button';
import userStore from '@/app/stores/userStore';
import { Avatar } from '@heroui/avatar';
import settingsStore from '@/app/stores/settingsStore';
import { useRouter } from 'next/navigation';

const OpenedSideBar = observer((props: { sideBarLayout: string }) => {
  const router = useRouter();

  return (
    <Drawer
      isOpen={menuStore.isOpen}
      onClose={menuStore.closeRightMenu}
      onOpenChange={menuStore.toggleRightMenu}
      placement="right"
      backdrop="transparent"
      hideCloseButton
      className={clsx(bg_container, props['sideBarLayout'], 'h-fit w-fit')}
    >
      <DrawerContent>
        <Button
          onPress={menuStore.toggleRightMenu}
          isIconOnly
          variant="bordered"
          size="sm"
          className="absolute -left-8 mt-8 border-none"
        >
          <ChevronRight className="stroke-default-400" />
        </Button>

        <DrawerHeader className="flex items-center justify-between gap-32">
          <div className="flex items-center justify-between gap-4">
            <Button
              onPress={() => {
                router.push('/profile');
              }}
              className="h-fit w-fit min-w-fit border-none p-0"
              variant="bordered"
            >
              <Avatar
                showFallback
                icon={<User2Icon className="h-64 w-64 stroke-default-200" />}
                name={userStore.user?.name as string}
                src={userStore.user?.image as string}
                size="lg"
                color="default"
              />
            </Button>
            <p className="text-small font-medium text-default-800">
              {userStore.user?.name}
            </p>
          </div>

          <Button
            onPress={() => {
              router.push('/profile');
            }}
            isIconOnly
            variant="light"
            size="md"
          >
            <UserCog2Icon className="stroke-default-500" />
          </Button>
        </DrawerHeader>
        <DrawerBody>
          <Tabs
            defaultSelectedKey={menuStore.activeTab as string}
            onSelectionChange={menuStore.setActiveTab.toString}
            variant="underlined"
            className="font-medium"
            classNames={{
              cursor: 'invisible',
              tab: 'pl-0',
            }}
          >
            <Tab key="0" title={settingsStore.t.menu.tabs.projects}>
              Your projects!
            </Tab>
            <Tab key="1" title={settingsStore.t.menu.tabs.teams}>
              Your teams!
            </Tab>
            <Tab key="2" title={settingsStore.t.menu.tabs.notifications}>
              Many many notifications
            </Tab>
          </Tabs>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
});

export default OpenedSideBar;

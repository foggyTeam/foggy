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
import { bg_container } from '@/app/lib/utils/style_definitions';
import clsx from 'clsx';
import { ChevronRight, UserCog2Icon, XIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import userStore from '@/app/stores/userStore';
import { Avatar } from '@heroui/avatar';
import settingsStore from '@/app/stores/settingsStore';

const OpenedSideBar = observer((props) => {
  return (
    <Drawer
      closeButton={
        <Button
          onPress={menuStore.closeRightMenu}
          isIconOnly
          variant="light"
          size="sm"
        >
          <XIcon className="stroke-default-400" />
        </Button>
      }
      isOpen={menuStore.isOpen}
      onClose={menuStore.closeRightMenu}
      onOpenChange={menuStore.toggleRightMenu}
      placement="right"
      backdrop="transparent"
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
            <Avatar
              showFallback
              name={userStore.user?.name}
              size="lg"
              color="secondary"
              src={userStore.user?.image}
            />
            <p className="text-small font-medium text-default-800">
              {userStore.user?.name}
            </p>
          </div>

          <Button
            onPress={() => {
              console.log('navigate to settings');
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
            variant="underlined"
            className="font-medium"
            fullWidth={true}
            classNames={{
              cursor: 'invisible',
              tab: 'justify-start pl-0',
            }}
            defaultSelectedKey={menuStore.activeTab}
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

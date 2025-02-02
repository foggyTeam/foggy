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
import { bg_container, sh_container } from '@/app/lib/utils/style_definitions';
import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';
import { Button } from '@heroui/button';

const OpenedSideBar = observer((props) => {
  return (
    <Drawer
      closeButton={
        <Button
          onPress={menuStore.toggleRightMenu}
          isIconOnly
          variant="light"
          size="md"
          radius="full"
        >
          <ChevronRight className="stroke-default-400" />
        </Button>
      }
      isOpen={menuStore.isOpen}
      onClose={menuStore.closeRightMenu}
      onOpenChange={menuStore.toggleRightMenu}
      placement="right"
      backdrop="transparent"
      className={clsx(
        bg_container,
        sh_container,
        props['sideBarLayout'],
        'h-fit w-fit',
      )}
    >
      <DrawerContent>
        <DrawerHeader>hi</DrawerHeader>
        <DrawerBody>
          <Tabs>
            <Tab title="Tab 1">Content for Tab 1</Tab>
            <Tab title="Tab 2">Content for Tab 2</Tab>
            <Tab title="Tab 3">Content for Tab 3</Tab>
          </Tabs>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
});

export default OpenedSideBar;

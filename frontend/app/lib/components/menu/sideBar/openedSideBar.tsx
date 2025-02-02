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

const OpenedSideBar = observer(() => {
  return (
    <Drawer
      isOpen={menuStore.isOpen}
      onClose={menuStore.closeRightMenu}
      onOpenChange={menuStore.toggleRightMenu}
      placement="right"
    >
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader>hi</DrawerHeader>
            <DrawerBody>
              <Tabs>
                <Tab title="Tab 1">Content for Tab 1</Tab>
                <Tab title="Tab 2">Content for Tab 2</Tab>
                <Tab title="Tab 3">Content for Tab 3</Tab>
              </Tabs>
            </DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
});

export default OpenedSideBar;

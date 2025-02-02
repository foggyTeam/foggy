'use client';
import { Avatar } from '@heroui/avatar';
import { Badge } from '@heroui/badge';
import { observer } from 'mobx-react-lite';
import userStore from '@/app/stores/userStore';
import { BellIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import menuStore from '@/app/stores/menuStore';

const ClosedSideBar = observer(() => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Avatar
        showFallback
        name={userStore.user?.name}
        size="lg"
        color="secondary"
        src={userStore.user?.image}
      />
      <Badge color="success" content={15} variant="flat">
        <Button
          onPress={() => {
            menuStore.setActiveTab(2);
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

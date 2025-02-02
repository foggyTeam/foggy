'use client';
import { Avatar } from '@heroui/avatar';
import { Badge } from '@heroui/badge';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';
import menuStore from '@/app/stores/menuStore';

export default function ClosedSideBar() {
  return (
    <div className="flex items-center space-x-4">
      <Avatar
        showFallback
        name="Junior"
        size="lg"
        className="h-12 w-12"
        color="primary"
        src="/images/img.png"
      />
      <Badge color="primary" content="5" />
      <FButton onPress={menuStore.toggleRightMenu}>Open Menu</FButton>
    </div>
  );
}

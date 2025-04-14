import { FilterObject } from '@/app/lib/types/definitions';
import {
  CalendarDaysIcon,
  KeyRoundIcon,
  UserRoundIcon,
  XIcon,
} from 'lucide-react';
import { Button } from '@heroui/button';
import { info, primary, secondary, success, warning } from '@/tailwind.config';
import GetDateTime from '@/app/lib/utils/getDateTime';

export default function FilterCard({
  filter,
  removeFilter,
}: {
  filter: FilterObject;
  removeFilter: any;
}) {
  const colorMap = {
    lastChange: secondary.DEFAULT,
    nickname: info.DEFAULT,
    name: primary.DEFAULT,
    role: warning.DEFAULT,
    default: success.DEFAULT,
  };
  const cardColor = colorMap[filter.field] || colorMap.default;

  return (
    <div
      style={{ borderColor: cardColor }}
      className="flex h-7 w-fit items-center justify-between gap-1 rounded-full border-1.5 px-2"
    >
      {filter.field === 'lastChange' && (
        <CalendarDaysIcon stroke={cardColor} className="h-4" />
      )}
      {filter.field === 'nickname' && (
        <UserRoundIcon stroke={cardColor} className="h-4" />
      )}
      {filter.field === 'role' && (
        <KeyRoundIcon stroke={cardColor} className="h-4" />
      )}
      <p style={{ color: cardColor }} className="text-xs">
        {filter.field === 'lastChange'
          ? GetDateTime(filter.referenceValue)
          : filter.referenceValue}
      </p>

      <Button
        onPress={() => removeFilter(filter.referenceValue)}
        isIconOnly
        className="h-6 w-6 min-w-6"
        variant="light"
        size="sm"
        radius="lg"
      >
        <XIcon stroke={cardColor} className="h-4" />
      </Button>
    </div>
  );
}

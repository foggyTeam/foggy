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
  filterKey,
  filterValue,
  removeFilter,
}: {
  filterKey: string;
  filterValue: string;
  removeFilter: any;
}) {
  const colorMap = {
    lastChange: secondary.DEFAULT,
    nickname: info.DEFAULT,
    name: primary.DEFAULT,
    role: warning.DEFAULT,
    default: success.DEFAULT,
  };
  const cardColor = colorMap[filterKey] || colorMap.default;

  return (
    <div
      style={{ borderColor: cardColor }}
      className="flex h-7 w-fit items-center justify-between gap-1 rounded-full border-1.5 px-2 transition-background hover:bg-primary/10"
    >
      {filterKey === 'lastChange' && (
        <CalendarDaysIcon stroke={cardColor} className="h-4" />
      )}
      {filterKey === 'nickname' && (
        <UserRoundIcon stroke={cardColor} className="h-4" />
      )}
      {filterKey === 'role' && (
        <KeyRoundIcon stroke={cardColor} className="h-4" />
      )}
      <p style={{ color: cardColor }} className="cursor-default text-xs">
        {filterKey === 'lastChange'
          ? filterValue
              .split('_')
              .map((date) => GetDateTime(date).split(',')[0])
              .join(' - ')
          : filterValue}
      </p>

      <Button
        onPress={() => removeFilter(filterKey, filterValue)}
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

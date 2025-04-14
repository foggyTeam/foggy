import { useMemo } from 'react';
import { checkFilters } from '@/app/lib/components/filters/filterMenu';

const useFilteredData = (
  data: any[],
  searchValue: string,
  filters,
  favorite: boolean,
  withNotification: boolean,
  userId: string,
) => {
  return useMemo(() => {
    return data.filter((value) => {
      const lowerCaseSearchValue: string = searchValue.toLowerCase();
      const lowerCaseDataValue: string =
        value.name?.toLowerCase() ||
        value.nickname?.toLowerCase() ||
        value.header?.toLowerCase();
      const searchValueIn: boolean = lowerCaseSearchValue.length
        ? lowerCaseDataValue.includes(lowerCaseSearchValue)
        : true;

      const hasUnreadNotifications: boolean = !!value.unreadNotifications;

      return (
        searchValueIn &&
        checkFilters(filters, value, userId) &&
        (favorite ? (value.favorite as boolean) : true) &&
        hasUnreadNotifications === withNotification
      );
    });
  }, [data, searchValue, filters, favorite, withNotification]);
};

export default useFilteredData;

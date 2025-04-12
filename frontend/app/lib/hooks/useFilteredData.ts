import { useMemo } from 'react';
import { checkFilters } from '@/app/lib/components/menu/filterMenu';

const useFilteredData = (
  data: any[],
  searchValue: string,
  filters,
  favorite: boolean,
  withNotification: boolean,
) => {
  return useMemo(() => {
    return data.filter((value) => {
      const searchValueIn: boolean =
        value.name?.includes(searchValue) ||
        value.nickname?.includes(searchValue);

      const hasUnreadNotifications: boolean = !!value.unreadNotifications;

      return (
        searchValueIn &&
        checkFilters(filters) &&
        value.favorite === favorite &&
        hasUnreadNotifications === withNotification
      );
    });
  }, [data, searchValue, filters, favorite, withNotification]);
};

export default useFilteredData;

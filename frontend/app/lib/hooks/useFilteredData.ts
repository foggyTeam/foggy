import { useMemo } from 'react';
import { checkFilters } from '@/app/lib/components/filters/filterMenu';

const useFilteredData = (
  data: any[],
  searchValue: string,
  filters,
  favorite: boolean,
  withNotification: boolean,
) => {
  return useMemo(() => {
    return data.filter((value) => {
      // TODO: fix that
      const searchValueIn: boolean = searchValue.length
        ? value.name?.includes(searchValue.toLowerCase()) ||
          value.nickname?.includes(searchValue.toLowerCase())
        : true;

      const hasUnreadNotifications: boolean = !!value.unreadNotifications;

      return (
        searchValueIn &&
        checkFilters(filters) &&
        (favorite ? (value.favorite as boolean) : true) &&
        hasUnreadNotifications === withNotification
      );
    });
  }, [data, searchValue, filters, favorite, withNotification]);
};

export default useFilteredData;

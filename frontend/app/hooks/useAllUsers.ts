import useSWR from 'swr';
import { getRequest } from '@/app/lib/utils/requests';
import { useEffect } from 'react';
import usersStore from '@/app/stores/usersStore';

export function useAllUsers() {
  const { data, error } = useSWR('/users', getRequest);

  useEffect(() => {
    if (data) {
      usersStore.setAllUsers(data);
    }
    if (error) {
      usersStore.setError('Failed to fetch users');
    }
  }, [data, error]);

  return { data, error };
}

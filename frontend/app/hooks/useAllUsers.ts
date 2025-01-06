import useSWR from 'swr';
import { fetcher } from '@/app/lib/utils/fetcher';
import { useEffect } from 'react';
import usersStore from '@/app/stores/usersStore';

export function useAllUsers() {
  const apiUri = process.env.NEXT_PUBLIC_API_URI;

  const { data, error } = useSWR(`${apiUri}/users`, fetcher);

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

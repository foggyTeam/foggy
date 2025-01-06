import useSWR from 'swr';
import { fetcher } from '@/app/lib/utils/fetcher';
import { useEffect } from 'react';
import usersStore from '@/app/stores/usersStore';
import nextConfig from '@/next.config';

export function useAllUsers() {
  const { data, error } = useSWR(`${nextConfig?.env?.API_URI}/users`, fetcher);

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

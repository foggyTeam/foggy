import useSWR from 'swr';
import { fetcher } from '@/app/lib/utils/fetcher';
import { useEffect } from 'react';
import petStore from '@/app/stores/petStore';

export function useCurrentPet(id: number) {
  const { data, error } = useSWR(
    `https://petstore.swagger.io/v2/pet/${id}`,
    fetcher,
  );

  useEffect(() => {
    if (data) {
      petStore.setCurrentPet(data);
    }
    if (error) {
      petStore.setError('Failed to fetch pets');
    }
  }, [data, error]);

  return { data, error };
}

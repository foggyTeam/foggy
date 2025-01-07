import useSWR from 'swr';
import { getRequest } from '@/app/lib/utils/requests';
import { useEffect } from 'react';
import petStore from '@/app/stores/petStore';

export function useCurrentPet(id: number) {
  const { data, error } = useSWR(
    `https://petstore.swagger.io/v2/pet/${id}`,
    getRequest,
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

import { useQuery } from '@tanstack/react-query';
import { restaurantsApi } from '../api/restaurants';

export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      return await restaurantsApi.getAll();
    },
  });
}

export function useRestaurant(id: string) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      return await restaurantsApi.getById(id);
    },
    enabled: !!id,
  });
}

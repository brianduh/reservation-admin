import { useQuery } from '@tanstack/react-query';
import { prioritiesApi } from '../api/priorities';

export function usePriorities(restaurantId: string) {
  return useQuery({
    queryKey: ['priorities', restaurantId],
    queryFn: async () => {
      return await prioritiesApi.getByRestaurant(restaurantId);
    },
    enabled: !!restaurantId,
  });
}

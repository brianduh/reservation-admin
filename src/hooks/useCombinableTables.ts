import { useQuery } from '@tanstack/react-query';
import { tablesApi } from '../api/tables';

export function useCombinableTables(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['combinable-tables', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      return await tablesApi.getCombinableByRestaurant(restaurantId);
    },
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000,
  });
}

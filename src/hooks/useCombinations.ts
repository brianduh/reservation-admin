import { useQuery } from '@tanstack/react-query';
import { combinationsApi } from '../api/combinations';

export function useCombinations(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['combinations', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      return await combinationsApi.getByRestaurant(restaurantId);
    },
    enabled: !!restaurantId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

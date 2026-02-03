import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../api/settings';

export function useSetting(restaurantId: string) {
  return useQuery({
    queryKey: ['setting', restaurantId],
    queryFn: async () => {
      return await settingsApi.getByRestaurant(restaurantId);
    },
    enabled: !!restaurantId,
  });
}

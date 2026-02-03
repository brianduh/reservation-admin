import client from './client';
import type { RestaurantSetting } from '../types';

export const settingsApi = {
  getByRestaurant: (restaurantId: string) =>
    client.get<RestaurantSetting>(`/v1/restaurants/${restaurantId}/settings`),

  update: (restaurantId: string, data: Partial<RestaurantSetting>) =>
    client.put<RestaurantSetting>(`/v1/restaurants/${restaurantId}/settings`, data),
};

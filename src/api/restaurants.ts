import client from './client';
import type { Restaurant } from '../types';

export const restaurantsApi = {
  getAll: () => client.get<Restaurant[]>('/restaurants'),

  getById: (id: string) => client.get<Restaurant>(`/restaurants/${id}`),

  getByCustomer: (customerId: string) =>
    client.get<Restaurant[]>(`/restaurants/customer/${customerId}`),

  create: (data: Partial<Restaurant>) =>
    client.post<Restaurant>('/restaurants', data),

  update: (id: string, data: Partial<Restaurant>) =>
    client.put<Restaurant>(`/restaurants/${id}`, data),

  delete: (id: string) => client.delete(`/restaurants/${id}`),
};

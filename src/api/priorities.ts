import client from './client';
import type { TableAssignmentPriority } from '../types';

export const prioritiesApi = {
  getByRestaurant: (restaurantId: string) =>
    client.get<TableAssignmentPriority[]>(`/v1/restaurants/${restaurantId}/priorities`),

  getActive: (restaurantId: string) =>
    client.get<TableAssignmentPriority[]>(`/v1/restaurants/${restaurantId}/priorities/active`),

  create: (restaurantId: string, data: Partial<TableAssignmentPriority>) =>
    client.post<TableAssignmentPriority>(`/v1/restaurants/${restaurantId}/priorities`, data),

  update: (restaurantId: string, priorityId: string, data: Partial<TableAssignmentPriority>) =>
    client.put<TableAssignmentPriority>(`/v1/restaurants/${restaurantId}/priorities/${priorityId}`, data),

  delete: (restaurantId: string, priorityId: string) =>
    client.delete(`/v1/restaurants/${restaurantId}/priorities/${priorityId}`),
};

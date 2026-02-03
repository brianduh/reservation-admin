import client from './client';

export interface Area {
  id: string;
  restaurantId: string;
  customerId: string;
  areaCode: string;
  areaName: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AreaRequest {
  restaurantId: string;
  customerId: string;
  areaCode: string;
  areaName: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export const areasApi = {
  // 查詢所有區域
  getAll: () =>
    client.get<Area[]>('/areas'),

  // 依餐廳查詢區域
  getByRestaurant: (restaurantId: string) =>
    client.get<Area[]>(`/areas/restaurant/${restaurantId}`),

  // 查詢單一區域
  getById: (id: string) =>
    client.get<Area>(`/areas/${id}`),

  // 建立區域
  create: (data: AreaRequest) =>
    client.post<Area>('/areas', data),

  // 更新區域
  update: (id: string, data: AreaRequest) =>
    client.put<Area>(`/areas/${id}`, data),

  // 刪除區域
  delete: (id: string) =>
    client.delete(`/areas/${id}`),
};

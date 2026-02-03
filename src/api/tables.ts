import client from './client';

export interface Table {
  id: string;
  restaurantId: string;
  customerId: string;
  areaId: string;
  tableCode: string;
  tableName: string;
  tableType: string;
  capacity: number;
  minGuests: number;
  maxGuests: number;
  isActive: boolean;
  isCombinable: boolean;
  positionInfo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // 後端額外回傳的欄位
  restaurantCode?: string;
  restaurantName?: string;
  areaCode?: string;
  areaName?: string;
}

export interface TableRequest {
  restaurantId: string;
  areaId: string;
  tableCode: string;
  tableName: string;
  tableType?: string;
  capacity: number;
  minGuests: number;
  maxGuests: number;
  isActive?: boolean;
  isCombinable?: boolean;
  positionInfo?: string;
  notes?: string;
}

export const tablesApi = {
  // 查詢所有餐桌
  getAll: () =>
    client.get<Table[]>('/tables'),

  // 依餐廳查詢餐桌
  getByRestaurant: (restaurantId: string) =>
    client.get<Table[]>(`/tables/restaurant/${restaurantId}`),

  // 依餐廳查詢啟用中的餐桌
  getActiveByRestaurant: (restaurantId: string) =>
    client.get<Table[]>(`/tables/restaurant/${restaurantId}/active`),

  // 依區域查詢餐桌
  getByArea: (areaId: string) =>
    client.get<Table[]>(`/tables/area/${areaId}`),

  // 查詢單一餐桌
  getById: (id: string) =>
    client.get<Table>(`/tables/${id}`),

  // 建立餐桌
  create: (data: TableRequest) =>
    client.post<Table>('/tables', data),

  // 更新餐桌
  update: (id: string, data: TableRequest) =>
    client.put<Table>(`/tables/${id}`, data),

  // 刪除餐桌
  delete: (id: string) =>
    client.delete(`/tables/${id}`),
};

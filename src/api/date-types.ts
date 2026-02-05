import client from './client';

export interface DateType {
  id: string;
  restaurantId: string;
  customerId: string;
  dateCode: string;
  dateName: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  color?: string; // 背景顏色 (Hex 格式: #RRGGBB)
  createdAt: string;
  updatedAt: string;
}

export interface DateTypeRequest {
  restaurantId: string;
  dateCode: string;
  dateName: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  color?: string; // 背景顏色 (Hex 格式: #RRGGBB)
}

export const dateTypesApi = {
  // 查詢所有日期性質
  getAll: () =>
    client.get<DateType[]>('/date-types'),

  // 依餐廳查詢日期性質
  getByRestaurant: (restaurantId: string) =>
    client.get<DateType[]>(`/date-types/restaurant/${restaurantId}`),

  // 依客戶查詢日期性質
  getByCustomer: (customerId: string) =>
    client.get<DateType[]>(`/date-types/customer/${customerId}`),

  // 查詢單一日期性質
  getById: (id: string) =>
    client.get<DateType>(`/date-types/${id}`),

  // 建立日期性質
  create: (data: DateTypeRequest) =>
    client.post<DateType>('/date-types', data),

  // 更新日期性質
  update: (id: string, data: DateTypeRequest) =>
    client.put<DateType>(`/date-types/${id}`, data),

  // 刪除日期性質
  delete: (id: string) =>
    client.delete(`/date-types/${id}`),
};

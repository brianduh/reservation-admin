import client from './client';

export interface MealPeriod {
  id: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  periodCode: string;
  periodName: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  diningDurationMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MealPeriodRequest {
  periodCode: string;
  periodName: string;
  description?: string;
  isActive: boolean;
  sortOrder?: number;
  diningDurationMinutes?: number;
}

export const mealPeriodsApi = {
  // 依客戶查詢餐期
  getByCustomer: (customerId: string) =>
    client.get<MealPeriod[]>(`/customers/${customerId}/meal-periods`),

  // 查詢單一餐期
  getById: (id: string) =>
    client.get<MealPeriod>(`/meal-periods/${id}`),

  // 建立餐期
  create: (customerId: string, data: MealPeriodRequest) =>
    client.post<MealPeriod>(`/customers/${customerId}/meal-periods`, data),

  // ���新餐期
  update: (customerId: string, id: string, data: MealPeriodRequest) =>
    client.put<MealPeriod>(`/customers/${customerId}/meal-periods/${id}`, data),

  // 刪除餐期
  delete: (customerId: string, id: string) =>
    client.delete(`/customers/${customerId}/meal-periods/${id}`),
};

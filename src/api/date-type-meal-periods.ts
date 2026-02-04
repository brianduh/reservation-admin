import client from './client';

export interface DateTypeMealPeriod {
  id: string;
  customerId: string;
  restaurantId: string;
  dateTypeId: string | null;
  dateTypeName: string;
  dateTypeCode: string;
  dateTypeSortOrder: number;
  mealPeriodId: string | null;
  mealPeriodName: string;
  mealPeriodCode: string;
  mealPeriodSortOrder: number;
  startTime: string;
  endTime: string;
  nextDayFlag: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DateTypeMealPeriodRequest {
  dateTypeId: string;
  mealPeriodId: string;
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  nextDayFlag: boolean;
  isActive: boolean;
}

export const dateTypeMealPeriodsApi = {
  // 查詢餐廳的所有日期性質餐期時間
  getByRestaurant: (restaurantId: string) =>
    client.get<DateTypeMealPeriod[]>(`/restaurants/${restaurantId}/date-type-meal-periods`),

  // 依日期性質查詢餐期時間
  getByDateType: (restaurantId: string, dateTypeId: string) =>
    client.get<DateTypeMealPeriod[]>(
      `/restaurants/${restaurantId}/date-type-meal-periods/by-date-type/${dateTypeId}`
    ),

  // 查詢單一日期性質餐期時間
  getById: (restaurantId: string, id: string) =>
    client.get<DateTypeMealPeriod>(`/restaurants/${restaurantId}/date-type-meal-periods/${id}`),

  // 建立日期性質餐期時間
  create: (restaurantId: string, data: DateTypeMealPeriodRequest) =>
    client.post<DateTypeMealPeriod>(`/restaurants/${restaurantId}/date-type-meal-periods`, data),

  // 更新日期性質餐期時間
  update: (restaurantId: string, id: string, data: DateTypeMealPeriodRequest) =>
    client.put<DateTypeMealPeriod>(`/restaurants/${restaurantId}/date-type-meal-periods/${id}`, data),

  // 刪除日期性質餐期時間
  delete: (restaurantId: string, id: string) =>
    client.delete(`/restaurants/${restaurantId}/date-type-meal-periods/${id}`),

  // 查詢餐廳在指定日期的營業時間（依餐期）
  getOperatingHours: (restaurantId: string, dateTypeId: string) =>
    client.get<DateTypeMealPeriod[]>(`/restaurants/${restaurantId}/operating-hours?dateTypeId=${dateTypeId}`),
};

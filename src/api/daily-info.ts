import client from './client';
import type {
  DailyInfo,
  DailyInfoRequest,
  BatchUpdateRequest,
  BatchUpdateResult,
} from '../types/daily-info';

export const dailyInfoApi = {
  // 查詢單日資料 - 使用 /date/{date} endpoint
  getByDate: (date: string, restaurantId?: string) =>
    client.get<DailyInfo>(`/daily-info/date/${date}`, {
      params: restaurantId ? { restaurantId } : undefined,
    }),

  // 查詢日期範圍資料 - 使用 /range endpoint
  getByRange: (startDate: string, endDate: string, restaurantId?: string) =>
    client.get<DailyInfo[]>('/daily-info/range', {
      params: {
        startDate,
        endDate,
        ...(restaurantId && { restaurantId }),
      },
    }),

  // 查詢餐廳所有資料
  getByRestaurant: (restaurantId: string) =>
    client.get<DailyInfo[]>(`/daily-info/restaurant/${restaurantId}`),

  // 查詢所有資料
  getAll: () =>
    client.get<DailyInfo[]>('/daily-info/all'),

  // 建立新記錄
  create: (data: DailyInfoRequest) =>
    client.post<DailyInfo>('/daily-info', data),

  // 更新記錄
  update: (id: string, data: DailyInfoRequest) =>
    client.put<DailyInfo>(`/daily-info/${id}`, data),

  // 更新備註 - 使用 PATCH /date/{date}/note endpoint
  updateNote: (date: string, restaurantId: string | undefined, note: string) =>
    client.patch<DailyInfo>(`/daily-info/date/${date}/note`, null, {
      params: {
        ...(restaurantId && { restaurantId }),
        dailyNote: note,
      },
    }),

  // 刪除記錄
  delete: (id: string) =>
    client.delete(`/daily-info/${id}`),

  // 批次更新日期性質（前端循環版本）
  batchUpdateDateType: async (data: BatchUpdateRequest): Promise<BatchUpdateResult> => {
    const results: BatchUpdateResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    // 使用 dayjs 處理日期範圍
    const dayjs = (await import('dayjs')).default;
    let current = dayjs(data.startDate);
    const end = dayjs(data.endDate);

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      const dateStr = current.format('YYYY-MM-DD');
      try {
        // 嘗試查詢是否已存在 (使用 /date/{date} endpoint)
        try {
          const existing = await client.get<DailyInfo>(`/daily-info/date/${dateStr}`, {
            params: data.restaurantId ? { restaurantId: data.restaurantId } : undefined,
          });

          // 更新現有記錄
          await client.put<DailyInfo>(`/daily-info/${(existing as any).id}`, {
            targetDate: dateStr,
            ...(data.restaurantId && { restaurantId: data.restaurantId }),
            dateTypeId: data.dateTypeId,
            ...(data.dailyNote && { dailyNote: data.dailyNote }),
          });
        } catch (error: any) {
          // 404 表示不存在，建立新記錄
          if (error.response?.status === 404) {
            await client.post<DailyInfo>('/daily-info', {
              targetDate: dateStr,
              ...(data.restaurantId && { restaurantId: data.restaurantId }),
              dateTypeId: data.dateTypeId,
              ...(data.dailyNote && { dailyNote: data.dailyNote }),
            });
          } else {
            throw error;
          }
        }
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          date: dateStr,
          error: error.response?.data?.message || error.message || '未知錯誤',
        });
      }
      current = current.add(1, 'day');
    }

    return results;
  },
};

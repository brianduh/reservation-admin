import client from './client';
import type {
  DailyInfo,
  DailyInfoRequest,
  BatchUpdateRequest,
  BatchUpdateResult,
  InitializeStatusResponse,
  InitializeYearRequest,
  InitializeYearResponse,
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

  // 更新日期性質 - 使用 PATCH /date/{date}/date-type endpoint
  updateDateType: (date: string, restaurantId: string | undefined, dateTypeId: string) =>
    client.patch<DailyInfo>(`/daily-info/date/${date}/date-type`, null, {
      params: {
        ...(restaurantId && { restaurantId }),
        dateTypeId,
      },
    }),

  // 批次更新日期性質（使用 PATCH endpoint，不需要提供農曆資訊）
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
        // 使用 PATCH endpoint 更新 dateTypeId
        await client.patch<DailyInfo>(`/daily-info/date/${dateStr}/date-type`, null, {
          params: {
            ...(data.restaurantId && { restaurantId: data.restaurantId }),
            dateTypeId: data.dateTypeId,
          },
        });

        // 如果有備註，也一併更新
        if (data.dailyNote) {
          await client.patch<DailyInfo>(`/daily-info/date/${dateStr}/note`, null, {
            params: {
              ...(data.restaurantId && { restaurantId: data.restaurantId }),
              dailyNote: data.dailyNote,
            },
          });
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

  // 檢查年度初始化狀態
  checkInitializeStatus: (year: number, restaurantId: string) =>
    client.get<InitializeStatusResponse>('/daily-info/initialize/status', {
      params: { restaurantId, year },
    }),

  // 初始化年度資料
  initializeYear: ({ restaurantId, year }: InitializeYearRequest) =>
    client.post<InitializeYearResponse>('/daily-info/initialize', null, {
      params: { restaurantId, year },
    }),
};

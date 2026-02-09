import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dailyInfoApi } from '../api/daily-info';
import type { DailyInfoRequest, BatchUpdateRequest } from '../types/daily-info';
import dayjs from 'dayjs';

export interface InitializeYearVariables {
  restaurantId: string;
  year: number;
}

export const useDailyInfos = (restaurantId?: string) => {
  const queryClient = useQueryClient();

  // 查詢月份資料
  const useMonthQuery = (year: number, month: number) => {
    const startDate = dayjs().year(year).month(month - 1).startOf('month').format('YYYY-MM-DD');
    const endDate = dayjs().year(year).month(month - 1).endOf('month').format('YYYY-MM-DD');

    return useQuery({
      queryKey: ['dailyInfos', 'month', year, month, restaurantId],
      queryFn: () => dailyInfoApi.getByRange(startDate, endDate, restaurantId),
      staleTime: 5 * 60 * 1000, // 5 分鐘快取
    });
  };

  // 查詢單日資料
  const useDateQuery = (date: string) => {
    return useQuery({
      queryKey: ['dailyInfos', 'date', date, restaurantId],
      queryFn: () => dailyInfoApi.getByDate(date, restaurantId),
      enabled: !!date,
      staleTime: 5 * 60 * 1000,
    });
  };

  // 建立新記錄
  const createMutation = useMutation({
    mutationFn: (data: DailyInfoRequest) => dailyInfoApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyInfos'] });
    },
  });

  // 更新記錄
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DailyInfoRequest }) =>
      dailyInfoApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyInfos'] });
    },
  });

  // 更新備註
  const updateNoteMutation = useMutation({
    mutationFn: ({ date, note }: { date: string; note: string }) =>
      dailyInfoApi.updateNote(date, restaurantId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyInfos'] });
    },
  });

  // 刪除記錄
  const deleteMutation = useMutation({
    mutationFn: (id: string) => dailyInfoApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyInfos'] });
    },
  });

  // 批次更新日期性質
  const batchUpdateMutation = useMutation({
    mutationFn: (data: BatchUpdateRequest) => dailyInfoApi.batchUpdateDateType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyInfos'] });
    },
  });

  // 查詢年度初始化狀態
  const useInitializeStatusQuery = (year: number, restaurantId: string) => {
    return useQuery({
      queryKey: ['dailyInfos', 'initializeStatus', year, restaurantId],
      queryFn: () => dailyInfoApi.checkInitializeStatus(year, restaurantId),
      enabled: !!year && !!restaurantId,
      staleTime: 2 * 60 * 1000, // 2 分鐘快取
      refetchOnWindowFocus: false,
    });
  };

  // 初始化年度資料
  const initializeYearMutation = useMutation({
    mutationFn: ({ restaurantId, year }: InitializeYearVariables) =>
      dailyInfoApi.initializeYear({ restaurantId, year }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyInfos'] });
      queryClient.invalidateQueries({ queryKey: ['dailyInfos', 'initializeStatus'] });
    },
  });

  return {
    useMonthQuery,
    useDateQuery,
    useInitializeStatusQuery,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    updateNote: updateNoteMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    batchUpdate: batchUpdateMutation.mutateAsync,
    initializeYear: initializeYearMutation.mutateAsync,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      updateNoteMutation.isPending ||
      deleteMutation.isPending ||
      batchUpdateMutation.isPending ||
      initializeYearMutation.isPending,
  };
};

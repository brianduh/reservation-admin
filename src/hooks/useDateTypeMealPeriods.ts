import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dateTypeMealPeriodsApi, type DateTypeMealPeriodRequest } from '../api/date-type-meal-periods';
import { message } from 'antd';

export function useDateTypeMealPeriods(restaurantId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dateTypeMealPeriods', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      return await dateTypeMealPeriodsApi.getByRestaurant(restaurantId);
    },
    enabled: !!restaurantId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const createMutation = useMutation({
    mutationFn: ({ restaurantId, data }: { restaurantId: string; data: DateTypeMealPeriodRequest }) =>
      dateTypeMealPeriodsApi.create(restaurantId, data),
    onSuccess: () => {
      message.success('建立成功');
      queryClient.invalidateQueries({ queryKey: ['dateTypeMealPeriods'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '建立失敗');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ restaurantId, id, data }: { restaurantId: string; id: string; data: DateTypeMealPeriodRequest }) =>
      dateTypeMealPeriodsApi.update(restaurantId, id, data),
    onSuccess: () => {
      message.success('更新成功');
      queryClient.invalidateQueries({ queryKey: ['dateTypeMealPeriods'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '更新失敗');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ restaurantId, id }: { restaurantId: string; id: string }) =>
      dateTypeMealPeriodsApi.delete(restaurantId, id),
    onSuccess: () => {
      message.success('刪除成功');
      queryClient.invalidateQueries({ queryKey: ['dateTypeMealPeriods'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '刪除失敗');
    },
  });

  return {
    dateTypeMealPeriods: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
  };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dateTypesApi, type DateTypeRequest } from '../api/date-types';

export const useDateTypes = (restaurantId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dateTypes', restaurantId],
    queryFn: () => restaurantId
      ? dateTypesApi.getByRestaurant(restaurantId)
      : dateTypesApi.getAll(),
    staleTime: 0, // 數據立即過期，總是重新獲取
    refetchOnWindowFocus: true, // 當視窗獲得焦點時重新獲取
    refetchOnMount: true, // 當組件掛載時重新獲取
  });

  const createMutation = useMutation({
    mutationFn: (data: DateTypeRequest) => dateTypesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dateTypes'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DateTypeRequest }) =>
      dateTypesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dateTypes'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dateTypesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dateTypes'] });
    },
  });

  return {
    dateTypes: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createDate: createMutation.mutateAsync,
    updateDate: updateMutation.mutateAsync,
    deleteDate: deleteMutation.mutateAsync,
  };
};

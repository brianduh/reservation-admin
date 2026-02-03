import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { areasApi } from '../api/areas';
import { message } from 'antd';

export function useAreas(restaurantId?: string) {
  const queryClient = useQueryClient();

  const areas = useQuery({
    queryKey: ['areas', restaurantId],
    queryFn: () => {
      if (restaurantId) {
        return areasApi.getByRestaurant(restaurantId);
      }
      return areasApi.getAll();
    },
    enabled: !!restaurantId,
  });

  const createArea = useMutation({
    mutationFn: areasApi.create,
    onSuccess: () => {
      message.success('建立成功');
      queryClient.invalidateQueries({ queryKey: ['areas'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '建立失敗');
    },
  });

  const updateArea = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof areasApi.update>[1] }) =>
      areasApi.update(id, data),
    onSuccess: () => {
      message.success('更新成功');
      queryClient.invalidateQueries({ queryKey: ['areas'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '更新失敗');
    },
  });

  const deleteArea = useMutation({
    mutationFn: areasApi.delete,
    onSuccess: () => {
      message.success('刪除成功');
      queryClient.invalidateQueries({ queryKey: ['areas'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '刪除失敗');
    },
  });

  return {
    areas: areas.data || [],
    isLoading: areas.isLoading,
    createArea,
    updateArea,
    deleteArea,
  };
}

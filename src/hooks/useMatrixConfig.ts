import { useMutation, useQuery } from '@tanstack/react-query';
import { message } from 'antd';
import { matrixApi } from '../api/matrix';
import type { MatrixSaveRequest } from '../types/matrix';

/**
 * 矩陣配置管理的 React Query Hook
 */
export function useMatrixConfig(restaurantId: string) {
  // 查詢矩陣配置
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['matrix-config', restaurantId],
    queryFn: async () => {
      return await matrixApi.getConfig(restaurantId);
    },
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000, // 5 分鐘
  });

  // 保存配置
  const saveMutation = useMutation({
    mutationFn: async (data: MatrixSaveRequest) => {
      console.log('saveMutation: calling API with', {
        restaurantId,
        prioritiesCount: data.priorities.length,
      });
      const response = await matrixApi.saveConfig(restaurantId, data);
      console.log('saveMutation: API response', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('saveMutation: onSuccess', data);
      const messageText = data?.message || '保存成功';
      message.success(messageText);
      refetch();
    },
    onError: (error: any) => {
      console.error('saveMutation: onError', error);
      const errorMessage =
        error.response?.data?.message || error.message || '保存失敗';
      message.error(errorMessage);
    },
  });

  // 清空配置
  const clearMutation = useMutation({
    mutationFn: async () => {
      await matrixApi.clearConfig(restaurantId);
    },
    onSuccess: () => {
      message.success('已清空所有配置');
      refetch();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || error.message || '清空失敗';
      message.error(errorMessage);
    },
  });

  return {
    data,
    isLoading,
    error,
    refetch,
    saveConfig: saveMutation.mutateAsync,
    clearConfig: clearMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    isClearing: clearMutation.isPending,
  };
}

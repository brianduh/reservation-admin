import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tablesApi, type TableRequest } from '../api/tables';
import { areasApi } from '../api/areas';

export const useTables = (restaurantId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tables', restaurantId],
    queryFn: () => restaurantId
      ? tablesApi.getByRestaurant(restaurantId)
      : tablesApi.getAll(),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const areasQuery = useQuery({
    queryKey: ['areas', restaurantId],
    queryFn: () => restaurantId
      ? areasApi.getByRestaurant(restaurantId)
      : areasApi.getAll(),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const createMutation = useMutation({
    mutationFn: (data: TableRequest) => tablesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TableRequest }) =>
      tablesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tablesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  return {
    tables: query.data || [],
    areas: areasQuery.data || [],
    isLoading: query.isLoading,
    areasLoading: areasQuery.isLoading,
    error: query.error,
    createTable: createMutation.mutateAsync,
    updateTable: updateMutation.mutateAsync,
    deleteTable: deleteMutation.mutateAsync,
  };
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mealPeriodsApi, type MealPeriodRequest } from '../api/meal-periods';

export const useMealPeriods = (customerId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['mealPeriods', customerId],
    queryFn: () => customerId
      ? mealPeriodsApi.getByCustomer(customerId)
      : Promise.resolve([]), // No customerId, return empty array
    enabled: !!customerId, // Only run query if customerId is provided
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const createMutation = useMutation({
    mutationFn: ({ customerId, data }: { customerId: string; data: MealPeriodRequest }) =>
      mealPeriodsApi.create(customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPeriods'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ customerId, id, data }: { customerId: string; id: string; data: MealPeriodRequest }) =>
      mealPeriodsApi.update(customerId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPeriods'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ customerId, id }: { customerId: string; id: string }) =>
      mealPeriodsApi.delete(customerId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPeriods'] });
    },
  });

  return {
    mealPeriods: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createMeal: createMutation.mutateAsync,
    updateMeal: updateMutation.mutateAsync,
    deleteMeal: deleteMutation.mutateAsync,
  };
};

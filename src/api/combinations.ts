import client from './client';

export interface TableCombinationItem {
  id: string;
  tableCombinationId: string;
  tableId: string;
  tableCode: string;
  tableName: string;
  tableCapacity: number;
  tableType: string;
  itemOrder: number;
  isRequired: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TableCombinationItemRequest {
  tableId: string;
  itemOrder: number;
  isRequired?: boolean;
  notes?: string;
}

export interface TableCombination {
  id: string;
  restaurantId: string;
  restaurantCode?: string;
  restaurantName?: string;
  combinationCode: string;
  combinationName: string;
  minGuests: number;
  maxGuests: number;
  sortOrder: number;
  isActive: boolean;
  conditions?: string;
  notes?: string;
  items: TableCombinationItem[];
  createdAt: string;
  updatedAt: string;
  actualTableCount?: number;
  isAvailable?: boolean;
  availabilityReason?: string;
}

export interface TableCombinationRequest {
  combinationCode: string;
  combinationName: string;
  minGuests: number;
  maxGuests: number;
  sortOrder: number;
  isActive: boolean;
  conditions?: string;
  notes?: string;
  items: TableCombinationItemRequest[];
}

export const combinationsApi = {
  getByRestaurant: (restaurantId: string) =>
    client.get<TableCombination[]>(`/v1/restaurants/${restaurantId}/combinations`),

  getActive: (restaurantId: string) =>
    client.get<TableCombination[]>(`/v1/restaurants/${restaurantId}/combinations/active`),

  getApplicable: (restaurantId: string, guestCount: number) =>
    client.get<TableCombination[]>(`/v1/restaurants/${restaurantId}/combinations/applicable`, {
      params: { guestCount }
    }),

  create: (restaurantId: string, data: TableCombinationRequest) =>
    client.post<TableCombination>(`/v1/restaurants/${restaurantId}/combinations`, data),

  update: (restaurantId: string, combinationId: string, data: TableCombinationRequest) =>
    client.put<TableCombination>(`/v1/restaurants/${restaurantId}/combinations/${combinationId}`, data),

  delete: (restaurantId: string, combinationId: string) =>
    client.delete(`/v1/restaurants/${restaurantId}/combinations/${combinationId}`),
};

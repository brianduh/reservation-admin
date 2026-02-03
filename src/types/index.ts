// 餐廳
export interface Restaurant {
  id: string;
  restaurantCode: string;
  restaurantName: string;
  customerId: string;
  address?: string;
  phone?: string;
  openingHours?: string;
  createdAt: string;
  updatedAt: string;
}

// 餐廳設定
export interface RestaurantSetting {
  id: string;
  restaurantId: string;
  autoAssignTable: boolean;
  advanceBookingDays: number;
  minAdvanceBookingHours: number;
  minGuestsPerReservation: number;
  maxGuestsPerReservation: number;
  allowOverbooking: boolean;
  overbookingThreshold: number;
  defaultReservationStatus: 'PENDING' | 'CONFIRMED';
  onlineBookingIntervalMinutes: number;
  defaultDiningDurationMinutes: number;
  maxCombinedTables: number;
  createdAt: string;
  updatedAt: string;
}

// 優先權類型
export type PriorityType = 'TABLE_TYPE' | 'AREA' | 'CAPACITY_RANGE' | 'FLOOR' | 'SPECIFIC_TABLE';

// 餐桌分配優先權
export interface TableAssignmentPriority {
  id: string;
  customerId: string;
  restaurantId: string;
  priorityType: PriorityType;
  priorityValue: string;
  sortOrder: number;
  weight: number;
  isActive: boolean;
  conditions?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 餐桌組合
export interface TableCombination {
  id: string;
  restaurantId: string;
  combinationCode: string;
  combinationName: string;
  targetGuestCount: number;
  totalCapacity: number;
  minTables: number;
  maxTables?: number;
  sortOrder: number;
  isActive: boolean;
  conditions?: string;
  notes?: string;
  items: TableCombinationItem[];
  actualTableCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TableCombinationItem {
  id: string;
  tableCombinationId: string;
  tableId: string;
  tableCode?: string;
  tableName?: string;
  tableCapacity?: number;
  tableType?: string;
  itemOrder: number;
  isRequired: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 日期性質
export interface DateType {
  id: string;
  restaurantId: string;
  customerId: string;
  dateCode: string;
  dateName: string;
  description?: string;
  color?: string;
  allowReservation: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 餐期
export interface MealPeriod {
  id: string;
  customerId: string;
  restaurantId?: string;
  periodCode: string;
  periodName: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 餐桌
export interface Table {
  id: string;
  restaurantId: string;
  customerId: string;
  areaId: string;
  tableCode: string;
  tableName: string;
  tableType: string;
  minSeatCount: number;
  maxSeatCount: number;
  status: 'AVAILABLE' | 'RESERVED' | 'MAINTENANCE';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 區域
export interface Area {
  id: string;
  restaurantId: string;
  customerId: string;
  areaCode: string;
  areaName: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 矩陣式優先權配置
export * from './matrix';

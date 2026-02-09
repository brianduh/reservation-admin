export interface DailyInfo {
  id: string;
  targetDate: string; // YYYY-MM-DD (backend uses targetDate)
  restaurantId?: string | null;
  customerId?: string | null;
  dateTypeId?: string | null;
  lunarDate?: string | null;
  lunarMonth?: number | null;
  lunarDay?: number | null;
  zodiac?: string | null;
  solarTerm?: string | null;
  suitableActivities?: string[] | string | null;
  unsuitableActivities?: string[] | string | null;
  dailyNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyInfoRequest {
  targetDate: string;
  restaurantId?: string;
  customerId?: string;
  dateTypeId?: string;
  dailyNote?: string;
}

export interface BatchUpdateRequest {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  restaurantId?: string;
  dateTypeId: string;
  dailyNote?: string;
}

export interface BatchUpdateResult {
  success: number;
  failed: number;
  errors: Array<{ date: string; error: string }>;
}

export interface InitializeStatusResponse {
  restaurantId: string;
  year: number;
  initialized: boolean;
  count: number;
  expectedCount: number;
}

export interface InitializeYearRequest {
  restaurantId: string;
  year: number;
}

export interface InitializeYearResponse {
  restaurantId: string;
  year: number;
  successCount: number;
  failedCount: number;
  totalCount: number;
  weekdayCount: number;
  weekendCount: number;
  errorMessage?: string;
}

/**
 * 訂位狀態
 */
export enum ReservationStatus {
    PENDING = 'PENDING',       // 待確認
    CONFIRMED = 'CONFIRMED',   // 已確認
    ARRIVED = 'ARRIVED',       // 已抵達
    SEATED = 'SEATED',         // 已入座
    COMPLETED = 'COMPLETED',   // 已完成
    CANCELLED = 'CANCELLED',   // 已取消
    NO_SHOW = 'NO_SHOW'        // 未出席
}

/**
 * 訂位狀態顯示文字對應
 */
export const ReservationStatusLabels: Record<ReservationStatus, string> = {
    [ReservationStatus.PENDING]: '待確認',
    [ReservationStatus.CONFIRMED]: '已確認',
    [ReservationStatus.ARRIVED]: '已抵達',
    [ReservationStatus.SEATED]: '已入座',
    [ReservationStatus.COMPLETED]: '已完成',
    [ReservationStatus.CANCELLED]: '已取消',
    [ReservationStatus.NO_SHOW]: '未出席'
};

/**
 * 分配的桌子資訊
 */
export interface AssignedTableInfo {
    tableId: string;
    tableCode: string;
    tableName: string;
    capacity: number;
    areaName: string;
    sortOrder: number;
    isCombinable: boolean;
}

/**
 * 訂位資料
 */
export interface Reservation {
    id: string;
    restaurantId: string;
    restaurantCode: string;
    restaurantName: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    reservationDate: string;
    reservationTime: string;
    guestCount: number;
    diningDurationMinutes: number;
    status: ReservationStatus;
    assignedTables: AssignedTableInfo[];
    isMultiTable: boolean;
    totalCapacity: number;
    mainTableId?: string;
    autoAssigned: boolean;
    note?: string;
    isWalkIn: boolean;
    arrivedAt?: string;
    seatedAt?: string;
    completedAt?: string;
    noShowMarkedAt?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * 建立訂位請求
 */
export interface ReservationRequest {
    restaurantId: string;
    customerName: string;
    customerPhone: string;
    reservationDate: string;
    reservationTime: string;
    guestCount: number;
    diningDurationMinutes?: number;
    tableIds?: string[];
    allowMultiTable?: boolean;
    note?: string;
    status?: ReservationStatus;
}

/**
 * 可用性查詢回應
 */
export interface AvailabilityResponse {
    restaurantId: string;
    date: string;
    guestCount: number;
    timeSlots: AvailableTimeSlot[];
    tables: AvailableTable[];
}

/**
 * 可用餐桌資訊
 */
export interface AvailableTable {
    tableId: string;
    tableName: string;
    areaId: string;
    areaName: string;
    minGuests: number;
    maxGuests: number;
    tableType: string;
    combinable: boolean;
    availableTimes: string[];
}

/**
 * 可用時段資訊
 */
export interface AvailableTimeSlot {
    startTime: string;
    endTime: string;
    availableTables: number;
    currentReservations: number;
    maxReservations: number;
    currentGuests: number;
    maxGuests: number;
    available: boolean;
}

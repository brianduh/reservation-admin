import client from './client';
import type { Reservation, ReservationRequest, AvailabilityResponse } from '../types/reservation';

/**
 * 查詢餐廳指定日期的訂位列表
 */
export const getReservationsByDate = async (
    restaurantId: string,
    date: string
): Promise<Reservation[]> => {
    return await client.get<Reservation[]>(
        `/reservations/restaurant/${restaurantId}/date/${date}`
    );
};

/**
 * 查詢餐廳的所有訂位
 */
export const getReservations = async (
    restaurantId: string
): Promise<Reservation[]> => {
    return await client.get<Reservation[]>(
        `/reservations/restaurant/${restaurantId}`
    );
};

/**
 * 查詢單筆訂位
 */
export const getReservation = async (id: string): Promise<Reservation> => {
    return await client.get<Reservation>(`/reservations/${id}`);
};

/**
 * 建立訂位
 */
export const createReservation = async (
    data: ReservationRequest
): Promise<Reservation> => {
    return await client.post<Reservation>('/reservations', data);
};

/**
 * 更新訂位
 */
export const updateReservation = async (
    id: string,
    data: ReservationRequest
): Promise<Reservation> => {
    return await client.put<Reservation>(`/reservations/${id}`, data);
};

/**
 * 取消訂位
 */
export const cancelReservation = async (id: string): Promise<Reservation> => {
    return await client.patch<Reservation>(
        `/reservations/${id}/cancel`
    );
};

/**
 * 刪除訂位
 */
export const deleteReservation = async (id: string): Promise<void> => {
    await client.delete(`/reservations/${id}`);
};

/**
 * 確認訂位
 */
export const confirmReservation = async (
    id: string,
    changedBy?: string,
    reason?: string
): Promise<Reservation> => {
    return await client.patch<Reservation>(
        `/reservations/${id}/confirm`,
        null,
        {
            params: { changedBy, reason },
        }
    );
};

/**
 * 標記已抵達
 */
export const markAsArrived = async (
    id: string,
    changedBy?: string,
    reason?: string
): Promise<Reservation> => {
    return await client.patch<Reservation>(
        `/reservations/${id}/arrive`,
        null,
        {
            params: { changedBy, reason },
        }
    );
};

/**
 * 標記已入座
 */
export const markAsSeated = async (
    id: string,
    tableId?: string,
    changedBy?: string,
    reason?: string
): Promise<Reservation> => {
    return await client.patch<Reservation>(
        `/reservations/${id}/seat`,
        null,
        {
            params: { tableId, changedBy, reason },
        }
    );
};

/**
 * 標記已完成
 */
export const markAsCompleted = async (
    id: string,
    changedBy?: string,
    reason?: string
): Promise<Reservation> => {
    return await client.patch<Reservation>(
        `/reservations/${id}/complete`,
        null,
        {
            params: { changedBy, reason },
        }
    );
};

/**
 * 標記未出席
 */
export const markAsNoShow = async (
    id: string,
    changedBy?: string,
    reason?: string
): Promise<Reservation> => {
    return await client.patch<Reservation>(
        `/reservations/${id}/no-show`,
        null,
        {
            params: { changedBy, reason },
        }
    );
};

/**
 * 查詢可用性（可用時段和餐桌）
 */
export const checkAvailability = async (params: {
    restaurantId: string;
    date: string;
    guests: number;
    time?: string; // 新增時間參數（HH:mm 格式）
}): Promise<AvailabilityResponse> => {
    return await client.get<AvailabilityResponse>('/reservations/availability', { params });
};

/**
 * 查詢可用時段列表（動態生成）
 * 根據日期性質和餐期動態生成可用的訂位時段
 */
export const getAvailableTimeSlots = async (params: {
    restaurantId: string;
    date: string; // 格式: YYYY-MM-DD
}): Promise<string[]> => {
    return await client.get<string[]>('/reservations/available-time-slots', { params });
};

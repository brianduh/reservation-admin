import client from './client';
import type { MatrixConfig, MatrixSaveRequest } from '../types/matrix';

/**
 * 矩陣優先權配置 API
 */
export const matrixApi = {
  /**
   * 取得矩陣配置
   */
  getConfig: (restaurantId: string) =>
    client.get<MatrixConfig>(`/v1/restaurants/${restaurantId}/priorities/matrix`),

  /**
   * 批量保存矩陣配置
   */
  saveConfig: (restaurantId: string, data: MatrixSaveRequest) =>
    client.post(`/v1/restaurants/${restaurantId}/priorities/matrix`, data),

  /**
   * 清空矩陣配置
   */
  clearConfig: (restaurantId: string) =>
    client.delete(`/v1/restaurants/${restaurantId}/priorities/matrix`),
};

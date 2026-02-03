/**
 * 矩陣式餐桌優先權配置的類型定義
 */

/**
 * 矩陣格子數據
 */
export interface MatrixCell {
  /** 優先順序（1-100，數字越小優先級越高） */
  priority?: number;
  /** 權重（1-100，預設 50） */
  weight?: number;
  /** 是否為虛擬併桌 */
  isCombination: boolean;
}

/**
 * 矩陣行數據（訂位人數）
 */
export interface MatrixRow {
  /** 訂位人數（1-10） */
  guestCount: number;
  /** 該人數對應的所有格子，key 為餐桌代碼 */
  cells: Map<string, MatrixCell>;
}

/**
 * 矩陣列數據（餐桌）
 */
export interface MatrixColumn {
  /** 餐桌代碼（實際餐桌的 tableCode 或虛擬併桌的 combinationCode） */
  code: string;
  /** 顯示名稱 */
  name: string;
  /** 容量（人數） */
  capacity: number;
  /** 類型（ACTUAL 或 COMBINATION） */
  type: 'ACTUAL' | 'COMBINATION';
  /** 是否可併桌（僅實際餐桌有效） */
  isCombinable?: boolean;
  /** 是否啟用 */
  isActive: boolean;
}

/**
 * 完整矩陣配置數據
 */
export interface MatrixConfig {
  /** 餐廳 ID */
  restaurantId: string;
  /** 矩陣行（1-10人） */
  rows: MatrixRow[];
  /** 矩陣列（所有餐桌） */
  columns: MatrixColumn[];
  /** 矩陣格子數據（原始 API 格式） */
  matrix?: Record<string, Record<string, MatrixCellDTO>>;
  /** 最後更新時間 */
  lastUpdated: string;
  /** 統計資訊 */
  stats?: MatrixStats;
}

/**
 * 矩陣保存請求（扁平化格式）
 */
export interface MatrixSaveRequest {
  /** 餐廳 ID */
  restaurantId: string;
  /** 優先權列表（只包含有設置優先權的格子） */
  priorities: MatrixCellSaveRequest[];
}

/**
 * 單個格子的保存請求
 */
export interface MatrixCellSaveRequest {
  /** 訂位人數 */
  guestCount: number;
  /** 餐桌代碼 */
  tableCode: string;
  /** 餐桌類型 */
  tableType: 'ACTUAL' | 'COMBINATION';
  /** 優先順序 */
  sortOrder: number;
  /** 權重 */
  weight: number;
}

/**
 * 矩陣統計資訊
 */
export interface MatrixStats {
  /** 總餐桌數（實際 + 虛擬） */
  totalColumns: number;
  /** 實際餐桌數 */
  actualTables: number;
  /** 虛擬併桌數 */
  combinationTables: number;
  /** 已配置的格子數 */
  configuredCells: number;
  /** 總格子數（行數 x 列數） */
  totalCells: number;
}

/**
 * 後端回應的統計資訊 DTO
 */
export interface MatrixStatsDTO {
  totalColumns: number;
  actualTables: number;
  combinationTables: number;
  configuredCells: number;
  totalCells: number;
}

/**
 * 後端回應的矩陣列定義 DTO
 */
export interface MatrixColumnDTO {
  code: string;
  name: string;
  capacity: number;
  type: string;
  isCombinable: boolean | null;
  isActive: boolean;
}

/**
 * 後端回應的矩陣格子數據 DTO
 */
export interface MatrixCellDTO {
  sortOrder: number;
  weight: number;
}

/**
 * 後端完整的矩陣配置回應
 */
export interface MatrixConfigResponse {
  restaurantId: string;
  columns: MatrixColumnDTO[];
  matrix: Record<string, Record<string, MatrixCellDTO>>;
  stats: MatrixStatsDTO;
}

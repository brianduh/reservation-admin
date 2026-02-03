import { Card, Spin, Alert } from 'antd';
import { MatrixGrid } from './components/MatrixGrid';
import { MatrixToolbar } from './components/MatrixToolbar';
import { MatrixStats } from './components/MatrixStats';
import { useMatrixConfig } from '../hooks/useMatrixConfig';
import { useRestaurantContext } from '../contexts/RestaurantContext';
import type { MatrixConfig, MatrixCell, MatrixSaveRequest, MatrixCellDTO } from '../types/matrix';
import { useState, useEffect } from 'react';

export default function TablePriority() {
  const { selectedRestaurant } = useRestaurantContext();
  const restaurantId = selectedRestaurant?.id;
  const [localConfig, setLocalConfig] = useState<MatrixConfig | null>(null);

  const {
    data: serverConfig,
    isLoading,
    refetch,
    saveConfig,
    clearConfig,
    isSaving,
    isClearing,
  } = useMatrixConfig(restaurantId!);

  // 當服務器數據變更時，更新本地配置
  useEffect(() => {
    if (serverConfig && !localConfig) {
      setLocalConfig(serverConfig);
    }
  }, [serverConfig, localConfig]);

  // 初始化矩陣數據（從 API 響應轉換為前端格式）
  useEffect(() => {
    if (serverConfig && !localConfig) {
      const rows = Array.from({ length: 10 }, (_, i) => {
        const matrixRow = serverConfig.matrix?.[String(i + 1)] || {};
        return {
          guestCount: i + 1,
          cells: new Map(
            Object.entries(matrixRow).map(([tableCode, cellData]: [string, MatrixCellDTO]) => [
              tableCode,
              {
                priority: cellData.sortOrder,
                weight: cellData.weight,
                isCombination:
                  serverConfig.columns.find((c) => c.code === tableCode)?.type ===
                  'COMBINATION',
              },
            ])
          ),
        };
      });

      const config: MatrixConfig = {
        restaurantId: serverConfig.restaurantId,
        rows,
        columns: serverConfig.columns.map((col) => ({
          code: col.code,
          name: col.name,
          capacity: col.capacity,
          type: col.type as 'ACTUAL' | 'COMBINATION',
          isCombinable: col.isCombinable ?? false,
          isActive: col.isActive,
        })),
        matrix: serverConfig.matrix,
        lastUpdated: new Date().toISOString(),
        stats: serverConfig.stats,
      };

      setLocalConfig(config);
    }
  }, [serverConfig, localConfig]);

  // 處理格子變更
  const handleCellChange = (
    guestCount: number,
    tableCode: string,
    cell: MatrixCell
  ) => {
    if (!localConfig) return;

    const updated = { ...localConfig };
    const row = updated.rows.find((r) => r.guestCount === guestCount);
    if (row) {
      if (cell.priority !== undefined) {
        row.cells.set(tableCode, cell);
      } else {
        row.cells.delete(tableCode);
      }
      setLocalConfig(updated);
    }
  };

  // 處理保存
  const handleSave = async () => {
    if (!localConfig) return;

    // 轉換��保存請求格式（只保存有設置優先權的格子）
    const priorities: MatrixSaveRequest['priorities'] = [];

    for (const row of localConfig.rows) {
      for (const [tableCode, cell] of row.cells.entries()) {
        if (cell.priority !== undefined) {
          const column = localConfig.columns.find((c) => c.code === tableCode);
          if (column) {
            priorities.push({
              guestCount: row.guestCount,
              tableCode,
              tableType: column.type,
              sortOrder: cell.priority,
              weight: cell.weight || 50,
            });
          }
        }
      }
    }

    console.log('Saving matrix config:', {
      restaurantId: restaurantId!,
      prioritiesCount: priorities.length,
      priorities: priorities.slice(0, 5), // 只印前 5 筆避免太多
    });

    try {
      await saveConfig({
        restaurantId: restaurantId!,
        priorities,
      });
      console.log('Matrix config saved successfully');
      // refetch 會在 hook 中自動調用
    } catch (error) {
      console.error('Failed to save matrix config:', error);
      // 錯誤處理已在 hook 中完成
    }
  };

  // 處理重置
  const handleReset = () => {
    setLocalConfig(null);
    // 強制重新載入服務器數據
    refetch();
  };

  // 處理清空
  const handleClear = async () => {
    try {
      await clearConfig();
      setLocalConfig(null);
    } catch (error) {
      // 錯誤處理已在 hook 中完成
    }
  };

  // 檢測是否有未保存的變更
  // 將本地配置轉換為可比較的格式
  const localCellsForComparison = localConfig
    ? localConfig.rows.flatMap((row) =>
        Array.from(row.cells.entries()).map(([tableCode, cell]) => ({
          guestCount: row.guestCount,
          tableCode,
          priority: cell.priority,
          weight: cell.weight,
        }))
      )
    : [];

  // 將服務器配置轉換為可比較的格式
  const serverCellsForComparison = serverConfig?.matrix
    ? Object.entries(serverConfig.matrix).flatMap(([guestCount, cells]) =>
        Object.entries(cells).map(([tableCode, cell]) => ({
          guestCount: parseInt(guestCount),
          tableCode,
          priority: cell.sortOrder,
          weight: cell.weight,
        }))
      )
    : [];

  // 比較兩個數組
  const hasChanges =
    localConfig !== null &&
    serverConfig !== null &&
    (localCellsForComparison.length !== serverCellsForComparison.length ||
      JSON.stringify(localCellsForComparison) !== JSON.stringify(serverCellsForComparison));

  // 沒有選擇餐廳時顯示提示
  if (!restaurantId) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          title="請先選擇要管理的餐廳"
          description="請在上方選擇下拉選單中選擇要管理的餐廳，或從餐廳管理頁面進入。"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  if (isLoading || !localConfig) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" tip="載入矩陣配置中..." />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>餐桌優先權矩陣配置</h1>

      {localConfig.stats && <MatrixStats stats={localConfig.stats} />}

      <Card>
        <MatrixToolbar
          loading={isSaving || isClearing}
          hasChanges={hasChanges}
          onSave={handleSave}
          onReset={handleReset}
          onClear={handleClear}
        />

        <MatrixGrid
          config={localConfig}
          loading={isLoading}
          onChange={handleCellChange}
        />
      </Card>
    </div>
  );
}

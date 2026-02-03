import { Table, Tag } from 'antd';
import { MatrixCellEditor } from './MatrixCellEditor';
import type { MatrixConfig, MatrixColumn, MatrixCell } from '../../types/matrix';

interface MatrixGridProps {
  /** 矩陣配置 */
  config: MatrixConfig;
  /** 是否載入中 */
  loading: boolean;
  /** 變更回調 */
  onChange: (guestCount: number, tableCode: string, cell: MatrixCell) => void;
}

export function MatrixGrid({ config, loading, onChange }: MatrixGridProps) {
  // 生成 1-10 人的行
  const guestCounts = Array.from({ length: 10 }, (_, i) => i + 1);

  // 生成列定義（固定左側的人數列 + 動態餐桌列）
  const columns = [
    {
      title: '人數',
      dataIndex: 'guestCount',
      fixed: 'left' as const,
      width: 80,
      align: 'center' as const,
      render: (count: number) => (
        <div
          style={{
            fontWeight: 'bold',
            fontSize: 14,
            padding: '8px 0',
          }}
        >
          {count}人
        </div>
      ),
    },
    ...config.columns.map((col: MatrixColumn) => ({
      title: (
        <div>
          <div style={{ fontWeight: 'bold' }}>{col.code}</div>
          <div
            style={{
              fontSize: 11,
              color: '#999',
              marginTop: 2,
            }}
          >
            {col.name}
            {col.type === 'COMBINATION' && (
              <Tag
                color="green"
                style={{ marginLeft: 4, fontSize: 10, fontWeight: 'normal' }}
              >
                虛擬
              </Tag>
            )}
          </div>
          <div style={{ fontSize: 11, color: '#999' }}>
            容量: {col.capacity}人
          </div>
        </div>
      ),
      dataIndex: col.code,
      width: 120,
      align: 'center' as const,
      render: (_: unknown, record: any) => {
        const cell = record.cells?.get(col.code);
        return (
          <MatrixCellEditor
            cell={cell}
            guestCount={record.guestCount}
            tableCode={col.code}
            isCombination={col.type === 'COMBINATION'}
            onChange={(updatedCell) =>
              onChange(record.guestCount, col.code, updatedCell)
            }
          />
        );
      },
    })),
  ];

  // 生成行數據
  const dataSource = guestCounts.map((guestCount) => {
    const row = config.rows.find((r) => r.guestCount === guestCount);
    return {
      key: `row-${guestCount}`,
      guestCount,
      cells: row?.cells || new Map(),
    };
  });

  return (
    <div className="matrix-grid-container">
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={false}
        scroll={{ x: 'max-content', y: 600 }}
        bordered
        size="small"
        rowKey="key"
      />
    </div>
  );
}

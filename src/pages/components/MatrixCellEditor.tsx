import { InputNumber, Popover, Space, Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { MatrixCell } from '../../types/matrix';

interface MatrixCellEditorProps {
  /** 格子數據 */
  cell?: MatrixCell;
  /** 訂位人數 */
  guestCount: number;
  /** 餐桌代碼 */
  tableCode: string;
  /** 是否為虛擬併桌 */
  isCombination: boolean;
  /** 變更回調 */
  onChange: (cell: MatrixCell) => void;
}

export function MatrixCellEditor({
  cell,
  guestCount,
  tableCode,
  isCombination,
  onChange,
}: MatrixCellEditorProps) {
  const [priority, setPriority] = useState<number | undefined>(cell?.priority);
  const [weight, setWeight] = useState<number>(cell?.weight || 50);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    if (priority !== undefined && priority > 0) {
      onChange({ priority, weight, isCombination });
    } else {
      // 清除配置
      onChange({ isCombination } as MatrixCell);
    }
    setOpen(false);
  };

  const handleCancel = () => {
    // 恢復原始值
    setPriority(cell?.priority);
    setWeight(cell?.weight || 50);
    setOpen(false);
  };

  const content = (
    <div style={{ width: 220 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: 4, fontSize: 12, color: '#666' }}>優先順序</div>
          <InputNumber
            min={1}
            max={100}
            value={priority}
            onChange={(val) => setPriority(val || undefined)}
            style={{ width: '100%' }}
            placeholder="留空表示不使用"
          />
        </div>
        <div>
          <div style={{ marginBottom: 4, fontSize: 12, color: '#666' }}>權重</div>
          <InputNumber
            min={1}
            max={100}
            value={weight}
            onChange={(val) => setWeight(val || 50)}
            style={{ width: '100%' }}
          />
        </div>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button size="small" onClick={handleCancel}>
            取消
          </Button>
          <Button type="primary" size="small" onClick={handleSave}>
            確定
          </Button>
        </Space>
      </Space>
    </div>
  );

  return (
    <Popover
      content={content}
      title={`${guestCount}人 - ${tableCode}`}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="top"
    >
      <div
        className="matrix-cell"
        style={{
          padding: '8px 12px',
          cursor: 'pointer',
          backgroundColor: priority !== undefined ? '#e6f7ff' : '#fafafa',
          border: priority !== undefined ? '1px solid #1890ff' : '1px solid #d9d9d9',
          borderRadius: 4,
          minHeight: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#1890ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor =
            priority !== undefined ? '#1890ff' : '#d9d9d9';
        }}
      >
        {priority !== undefined ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#1890ff',
                lineHeight: 1,
              }}
            >
              {priority}
            </div>
            {weight !== 50 && (
              <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>
                w:{weight}
              </div>
            )}
          </div>
        ) : (
          <SettingOutlined style={{ color: '#d9d9d9', fontSize: 16 }} />
        )}
      </div>
    </Popover>
  );
}

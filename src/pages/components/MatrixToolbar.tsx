import { Button, Space, Popconfirm } from 'antd';
import { SaveOutlined, ReloadOutlined, ClearOutlined } from '@ant-design/icons';

interface MatrixToolbarProps {
  /** 是否載入中 */
  loading: boolean;
  /** 是否有變更 */
  hasChanges: boolean;
  /** 保存回調 */
  onSave: () => void;
  /** 重置回調 */
  onReset: () => void;
  /** 清空回調 */
  onClear: () => void;
}

export function MatrixToolbar({
  loading,
  hasChanges,
  onSave,
  onReset,
  onClear,
}: MatrixToolbarProps) {
  return (
    <div className="matrix-toolbar" style={{ marginBottom: 16 }}>
      <Space>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={loading}
          disabled={!hasChanges}
          onClick={onSave}
        >
          保存配置
        </Button>

        <Button
          icon={<ReloadOutlined />}
          onClick={onReset}
          disabled={!hasChanges}
        >
          重置更改
        </Button>

        <Popconfirm
          title="確認清空所有配置？"
          description="此操作將清除所有已設置的優先權規則，且無法復原"
          okText="確認"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={onClear}
        >
          <Button danger icon={<ClearOutlined />}>
            清空全部
          </Button>
        </Popconfirm>
      </Space>
    </div>
  );
}

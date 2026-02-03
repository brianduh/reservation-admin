import { Modal, Form, DatePicker, Select, Input, Alert, Space, Typography, Progress } from 'antd';
import { useState, useMemo } from 'react';
import type { Dayjs } from 'dayjs';
import type { BatchUpdateRequest, BatchUpdateResult } from '../../types/daily-info';
import { useDateTypes } from '../../hooks/useDateTypes';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface BatchUpdateModalProps {
  open: boolean;
  restaurantId?: string;
  onCancel: () => void;
  onOk: (data: BatchUpdateRequest) => Promise<BatchUpdateResult>;
  loading?: boolean;
}

export default function BatchUpdateModal({
  open,
  restaurantId,
  onCancel,
  onOk,
  loading = false,
}: BatchUpdateModalProps) {
  const [form] = Form.useForm();
  const { dateTypes } = useDateTypes(restaurantId);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [result, setResult] = useState<BatchUpdateResult | null>(null);

  // 計算選擇的天數
  const selectedDays = useMemo(() => {
    const range = form.getFieldValue('dateRange');
    if (!range || range.length !== 2) return 0;

    const start = range[0] as Dayjs;
    const end = range[1] as Dayjs;
    return end.diff(start, 'day') + 1;
  }, [form.getFieldValue('dateRange')]);

  // 日期性質選項 - dateTypes 在 runtime 已經是 array，但類型系統認為是 AxiosResponse
  const dateTypeOptions = (Array.isArray(dateTypes) ? dateTypes : []).map((dt: any) => ({
    label: dt.dateName,
    value: dt.id,
  }));

  // 處理確認
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const range = values.dateRange;

      const data: BatchUpdateRequest = {
        startDate: range[0].format('YYYY-MM-DD'),
        endDate: range[1].format('YYYY-MM-DD'),
        restaurantId,
        dateTypeId: values.dateTypeId,
        dailyNote: values.dailyNote,
      };

      // 設定進度
      setProgress({ current: 0, total: selectedDays });

      const response = await onOk(data);

      setResult(response);
      setProgress(null);
    } catch (error) {
      setProgress(null);
    }
  };

  // 關閉 Modal 時重置狀態
  const handleCancel = () => {
    form.resetFields();
    setProgress(null);
    setResult(null);
    onCancel();
  };

  return (
    <Modal
      title="批次設定日期性質"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading || progress !== null}
      width={600}
      okText="開始批次設定"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          dateRange: null,
          dateTypeId: undefined,
          dailyNote: '',
        }}
      >
        <Form.Item
          label="選擇日期範圍"
          name="dateRange"
          rules={[{ required: true, message: '請選擇日期範圍' }]}
        >
          <RangePicker
            style={{ width: '100%' }}
            placeholder={['開始日期', '結束日期']}
            format="YYYY-MM-DD"
          />
        </Form.Item>

        {selectedDays > 0 && (
          <Alert
            message={`將處理 ${selectedDays} 天的資料`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item
          label="套用日期性質"
          name="dateTypeId"
          rules={[{ required: true, message: '請選擇日期性質' }]}
          tooltip="將選擇的日期性質套用到上述範圍的所有日期"
        >
          <Select
            placeholder="請選擇要套用的日期性質"
            options={dateTypeOptions}
          />
        </Form.Item>

        <Form.Item
          label="批次備註"
          name="dailyNote"
          tooltip="可選填，會套用到所有日期（若日期已有備註將被覆蓋）"
        >
          <Input.TextArea
            rows={3}
            placeholder="例如：春節營業時間調整"
            maxLength={500}
            showCount
          />
        </Form.Item>

        {/* 進度顯示 */}
        {progress && (
          <div style={{ marginTop: 16 }}>
            <Text>處理進度：{progress.current} / {progress.total}</Text>
            <Progress
              percent={Math.round((progress.current / progress.total) * 100)}
              status="active"
            />
          </div>
        )}

        {/* 結果顯示 */}
        {result && (
          <Alert
            message={
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>批次設定完成！</Text>
                <Text type="success">成功：{result.success} 筆</Text>
                {result.failed > 0 && (
                  <Text type="danger">失敗：{result.failed} 筆</Text>
                )}
                {result.errors.length > 0 && (
                  <details style={{ marginTop: 8 }}>
                    <summary style={{ cursor: 'pointer' }}>查看錯誤詳情</summary>
                    <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                      {result.errors.map((error, index) => (
                        <li key={index}>
                          <Text type="danger">
                            {error.date}: {error.error}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </Space>
            }
            type={result.failed === 0 ? 'success' : 'warning'}
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Form>
    </Modal>
  );
}

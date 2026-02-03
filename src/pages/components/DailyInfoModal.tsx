import { Modal, Form, Select, Input, Descriptions, Tag, Space, Alert } from 'antd';
import type { DailyInfo } from '../../types/daily-info';
import { useDateTypes } from '../../hooks/useDateTypes';

interface DailyInfoModalProps {
  open: boolean;
  dailyInfo?: DailyInfo | null;
  selectedDate: string;
  restaurantId?: string;
  onCancel: () => void;
  onOk: (values: any) => void;
  loading?: boolean;
}

export default function DailyInfoModal({
  open,
  dailyInfo,
  selectedDate,
  restaurantId,
  onCancel,
  onOk,
  loading = false,
}: DailyInfoModalProps) {
  const [form] = Form.useForm();
  const { dateTypes } = useDateTypes(restaurantId);

  // 處理確認
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      // 表單驗證失敗
    }
  };

  // 格式化農曆宜忌陣列
  const formatActivities = (activities: string[] | string | null | undefined): string => {
    if (!activities) return '';
    if (Array.isArray(activities)) {
      return activities.join('、');
    }
    return String(activities);
  };

  // 日期性質選項 - dateTypes 在 runtime 已經是 array，但類型系統認為是 AxiosResponse
  const dateTypeOptions = (Array.isArray(dateTypes) ? dateTypes : []).map((dt: any) => ({
    label: dt.dateName,
    value: dt.id,
  }));

  return (
    <Modal
      title={
        <Space>
          <span>編輯每日資訊</span>
          <Tag color="blue">{selectedDate}</Tag>
        </Space>
      }
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      width={700}
      okText="儲存"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          dateTypeId: dailyInfo?.dateTypeId,
          dailyNote: dailyInfo?.dailyNote || '',
        }}
      >
        {/* 可編輯欄位 */}
        <Form.Item
          label="日期性質"
          name="dateTypeId"
          tooltip="選擇該日期的性質（平日、假日、休館日等）"
        >
          <Select
            placeholder="請選擇日期性質"
            options={dateTypeOptions}
            allowClear
          />
        </Form.Item>

        <Form.Item
          label="備註"
          name="dailyNote"
          tooltip="可填寫特殊事項、活動說明等"
        >
          <Input.TextArea
            rows={3}
            placeholder="例如：春季特別營業、食材供應特殊安排等"
            maxLength={500}
            showCount
          />
        </Form.Item>

        {/* 唯讀農曆資訊 */}
        {dailyInfo && (
          <>
            <Alert
              message="農曆資訊（唯讀）"
              description="以下資訊來自農民曆，不允許修改"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="農曆日期">
                {dailyInfo.lunarDate || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="生肖年份">
                {dailyInfo.zodiac || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="節氣" span={2}>
                {dailyInfo.solarTerm || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="宜" span={2}>
                {formatActivities(dailyInfo.suitableActivities) || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="忌" span={2}>
                {formatActivities(dailyInfo.unsuitableActivities) || '-'}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Form>
    </Modal>
  );
}

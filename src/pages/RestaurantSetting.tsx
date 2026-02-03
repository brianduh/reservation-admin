import { useParams } from 'react-router-dom';
import { Card, Form, InputNumber, Switch, Button, Space, message } from 'antd';
import { useSetting } from '../hooks/useSettings';
import { settingsApi } from '../api/settings';

export default function RestaurantSetting() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useSetting(id!);
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      await settingsApi.update(id!, values);
      message.success('更新成功');
    } catch (error) {
      message.error('更新失敗');
    }
  };

  return (
    <div>
      <h1>餐廳設定</h1>
      <Card loading={isLoading}>
        <Form
          form={form}
          layout="vertical"
          initialValues={data}
          onFinish={handleSubmit}
        >
          <Form.Item label="自動分配餐桌" name="autoAssignTable" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="提前預約天數" name="advanceBookingDays">
            <InputNumber min={1} max={365} />
          </Form.Item>

          <Form.Item label="最少用餐人數" name="minGuestsPerReservation">
            <InputNumber min={1} max={20} />
          </Form.Item>

          <Form.Item label="最多用餐人數" name="maxGuestsPerReservation">
            <InputNumber min={1} max={50} />
          </Form.Item>

          <Form.Item label="預設用餐時長（分鐘）" name="defaultDiningDurationMinutes">
            <InputNumber min={30} max={300} step={15} />
          </Form.Item>

          <Form.Item label="最多可組合桌子數" name="maxCombinedTables">
            <InputNumber min={1} max={10} />
          </Form.Item>

          <Form.Item label="是否允許超額預訂" name="allowOverbooking" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">儲存</Button>
              <Button onClick={() => form.resetFields()}>重設</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

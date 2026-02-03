import { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  TimePicker,
  Switch,
  Space,
  message,
  Popconfirm,
  Alert,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDateTypeMealPeriods } from '../hooks/useDateTypeMealPeriods';
import { useDateTypes } from '../hooks/useDateTypes';
import { useMealPeriods } from '../hooks/useMealPeriods';
import type { DateTypeMealPeriod } from '../api/date-type-meal-periods';
import { useRestaurantContext } from '../contexts/RestaurantContext';
import dayjs from 'dayjs';

export default function DateTypeMealPeriodManagement() {
  const { selectedRestaurant } = useRestaurantContext();
  const customerId = selectedRestaurant?.customerId;

  const { dateTypeMealPeriods, isLoading, create, update, delete: deletePeriod } = useDateTypeMealPeriods(selectedRestaurant?.id);
  const { dateTypes } = useDateTypes(selectedRestaurant?.id);
  const { mealPeriods } = useMealPeriods(customerId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DateTypeMealPeriod | null>(null);
  const [form] = Form.useForm();

  const sortedData = useMemo(() => {
    return [...dateTypeMealPeriods].sort((a, b) => {
      const dateTypeCompare = a.dateTypeCode.localeCompare(b.dateTypeCode);
      if (dateTypeCompare !== 0) return dateTypeCompare;
      return a.mealPeriodCode.localeCompare(b.mealPeriodCode);
    });
  }, [dateTypeMealPeriods]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: DateTypeMealPeriod) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      startTime: dayjs(record.startTime, 'HH:mm:ss'),
      endTime: dayjs(record.endTime, 'HH:mm:ss'),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!selectedRestaurant) return;
    try {
      await deletePeriod({ restaurantId: selectedRestaurant.id, id });
      message.success('刪除成功');
    } catch (error) {
      message.error('刪除失敗');
    }
  };

  const handleSubmit = async () => {
    if (!selectedRestaurant) return;

    try {
      const values = await form.validateFields();

      const data = {
        dateTypeId: values.dateTypeId,
        mealPeriodId: values.mealPeriodId,
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm'),
        nextDayFlag: values.nextDayFlag,
        isActive: values.isActive,
      };

      if (editingRecord) {
        await update({ restaurantId: selectedRestaurant.id, id: editingRecord.id, data });
        message.success('更新成功');
      } else {
        await create({ restaurantId: selectedRestaurant.id, data });
        message.success('建立成功');
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失敗');
    }
  };

  const columns = [
    {
      title: '日期性質',
      dataIndex: 'dateTypeName',
      key: 'dateTypeName',
      render: (text: string, record: DateTypeMealPeriod) => (
        <Space>
          <Tag color={record.dateTypeCode === 'N' ? 'blue' : record.dateTypeCode === 'H' ? 'orange' : 'green'}>
            {record.dateTypeCode}
          </Tag>
          {text}
        </Space>
      ),
    },
    {
      title: '餐期',
      dataIndex: 'mealPeriodName',
      key: 'mealPeriodName',
      render: (text: string, record: DateTypeMealPeriod) => (
        <Space>
          <Tag color="purple">{record.mealPeriodCode}</Tag>
          {text}
        </Space>
      ),
    },
    {
      title: '開始時間',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string) => time.substring(0, 5),
    },
    {
      title: '結束時間',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (time: string, record: DateTypeMealPeriod) => (
        <Space>
          <span>{time.substring(0, 5)}</span>
          {record.nextDayFlag && <Tag color="red">跨日</Tag>}
        </Space>
      ),
    },
    {
      title: '狀態',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'red'}>
          {value ? '啟用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: DateTypeMealPeriod) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            編輯
          </Button>
          <Popconfirm
            title="確定要刪除嗎？"
            onConfirm={() => handleDelete(record.id)}
            okText="確定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              刪除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!selectedRestaurant) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="請先選擇要管理的餐廳"
          description="請在上方選擇下拉選單中選擇要管理的餐廳。"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>日期性質餐期時間管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增設定
        </Button>
      </div>

      <Alert
        message="說明"
        description="此處設定各日期性質（平日/假日/店休）在各餐期的營業時間。例如：平日早餐 07:00-11:00、假日晚餐 17:00-02:00（跨日）。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Table
        columns={columns}
        dataSource={sortedData}
        loading={isLoading}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingRecord ? '編輯��期性質餐期時間' : '新增日期性質餐期時間'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="日期性質"
            name="dateTypeId"
            rules={[{ required: true, message: '請選擇日期性質' }]}
          >
            <Select placeholder="請選擇日期性質">
              {dateTypes.map((dt) => (
                <Select.Option key={dt.id} value={dt.id}>
                  {dt.dateName} ({dt.dateCode})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="餐期"
            name="mealPeriodId"
            rules={[{ required: true, message: '請選擇餐期' }]}
          >
            <Select placeholder="請選擇餐期">
              {mealPeriods.map((mp) => (
                <Select.Option key={mp.id} value={mp.id}>
                  {mp.periodName} ({mp.periodCode})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="開始時間"
            name="startTime"
            rules={[{ required: true, message: '請輸入開始時間' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="結束時間"
            name="endTime"
            rules={[{ required: true, message: '請輸入結束時間' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="跨日"
            name="nextDayFlag"
            valuePropName="checked"
            initialValue={false}
            tooltip="如果結束時間已跨到隔天（如：晚餐到凌晨2點），請勾選此項"
          >
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>

          <Form.Item
            label="啟用"
            name="isActive"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

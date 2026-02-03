import { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  InputNumber,
  message,
  Popconfirm,
  Alert,
  Space,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMealPeriods } from '../hooks/useMealPeriods';
import type { MealPeriod } from '../api/meal-periods';
import { useSearchParams } from 'react-router-dom';
import { useRestaurantContext } from '../contexts/RestaurantContext';

export default function MealPeriodManagement() {
  const { selectedRestaurant } = useRestaurantContext();
  const [searchParams] = useSearchParams();

  // 優先使用 Context 中的餐廳，其次使用 URL 參數
  const restaurantId = selectedRestaurant?.id || searchParams.get('restaurantId') || undefined;

  // 從餐廳取得客戶 ID（餐期現在是客戶層級）
  const customerId = selectedRestaurant?.customerId;

  // 必須在所有 hooks 調用之後才能有條件返回
  const { mealPeriods, isLoading, createMeal, updateMeal, deleteMeal } = useMealPeriods(customerId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MealPeriod | null>(null);
  const [form] = Form.useForm();

  // 依排序欄位排序
  const sortedMealPeriods = useMemo(() => {
    return [...mealPeriods].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [mealPeriods]);

  // 如果沒有選定餐廳，顯示提示訊息（在所有 hooks 之後）
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

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: MealPeriod) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      if (!customerId) {
        message.error('缺少客戶 ID');
        return;
      }
      await deleteMeal({ customerId, id });
      message.success('刪除成功');
    } catch (error) {
      message.error('刪除失敗');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!customerId) {
        message.error('缺少客戶 ID');
        return;
      }

      const data = {
        ...values,
      };

      if (editingRecord) {
        await updateMeal({ customerId, id: editingRecord.id, data });
        message.success('更新成功');
      } else {
        await createMeal({ customerId, data });
        message.success('建立成功');
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失敗');
    }
  };

  const columns = [
    { title: '代碼', dataIndex: 'periodCode', key: 'periodCode', width: 120 },
    { title: '名稱', dataIndex: 'periodName', key: 'periodName', width: 120 },
    { title: '說明', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '用餐時長',
      dataIndex: 'diningDurationMinutes',
      key: 'diningDurationMinutes',
      width: 100,
      render: (value?: number) => value ? `${value}分鐘` : '-',
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
    },
    {
      title: '啟用',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (value: boolean) => (value ? '是' : '否'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: unknown, record: MealPeriod) => (
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

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>餐期管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增餐期
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={sortedMealPeriods}
        loading={isLoading}
        rowKey="id"
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingRecord ? '編輯餐期' : '新增餐期'}
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
            label="代碼"
            name="periodCode"
            rules={[{ required: true, message: '請輸入代碼' }]}
          >
            <Input placeholder="如：BREAKFAST, LUNCH, DINNER" />
          </Form.Item>

          <Form.Item
            label="名稱"
            name="periodName"
            rules={[{ required: true, message: '請輸入名稱' }]}
          >
            <Input placeholder="如：早餐、午餐、晚餐" />
          </Form.Item>

          <Form.Item label="說明" name="description">
            <Input.TextArea rows={2} placeholder="說明文字" />
          </Form.Item>

          <Form.Item
            label="用餐時長（分鐘）"
            name="diningDurationMinutes"
            tooltip="0 表示不限制，留空表示使用餐廳預設值"
          >
            <InputNumber min={0} placeholder="0" style={{ width: 150 }} />
          </Form.Item>

          <Form.Item
            label="排序順序"
            name="sortOrder"
            rules={[{ required: true, message: '請輸入排序順序' }]}
            tooltip="數字越小越優先顯示"
          >
            <InputNumber min={0} style={{ width: 150 }} />
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

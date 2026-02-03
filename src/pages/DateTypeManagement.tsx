import { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  InputNumber,
  Space,
  message,
  Popconfirm,
  Alert,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useDateTypes } from '../hooks/useDateTypes';
import type { DateType } from '../api/date-types';
import { useSearchParams } from 'react-router-dom';
import { useRestaurantContext } from '../contexts/RestaurantContext';

export default function DateTypeManagement() {
  const { selectedRestaurant } = useRestaurantContext();
  const [searchParams] = useSearchParams();

  // 優先使用 Context 中的餐廳，其次使用 URL 參數
  const restaurantId = selectedRestaurant?.id || searchParams.get('restaurantId') || undefined;

  // 必須在所有 hooks 調用之後才能有條件返回
  const { dateTypes, isLoading, createDate, updateDate, deleteDate, refetch } = useDateTypes(restaurantId);

  // 依排序欄位排序
  const sortedDateTypes = useMemo(() => {
    return [...dateTypes].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [dateTypes]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DateType | null>(null);
  const [form] = Form.useForm();

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

  const handleEdit = (record: DateType) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDate(id);
      message.success('刪除成功');
    } catch (error) {
      message.error('刪除失敗');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 使用編輯記錄中的 restaurantId，或從 URL 獲取
      const actualRestaurantId = editingRecord?.restaurantId || restaurantId;

      if (!actualRestaurantId) {
        message.error('缺少餐廳 ID');
        return;
      }

      const data = {
        ...values,
        restaurantId: actualRestaurantId,
      };

      if (editingRecord) {
        await updateDate({ id: editingRecord.id, data });
        message.success('更新成功');
      } else {
        await createDate(data);
        message.success('建立成功');
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失敗');
    }
  };

  const columns = [
    { title: '代碼', dataIndex: 'dateCode', key: 'dateCode', width: 120 },
    { title: '名稱', dataIndex: 'dateName', key: 'dateName', width: 150 },
    { title: '說明', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 80 },
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
      width: 150,
      fixed: 'right' as const,
      render: (_: unknown, record: DateType) => (
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>日期類型管理</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            重新載入
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增日期類型
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={sortedDateTypes}
        loading={isLoading}
        rowKey="id"
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingRecord ? '編輯日期類型' : '新增日期類型'}
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
            name="dateCode"
            rules={[{ required: true, message: '請輸入代碼' }]}
          >
            <Input placeholder="如：NORMAL, HOLIDAY, CLOSED" />
          </Form.Item>

          <Form.Item
            label="名稱"
            name="dateName"
            rules={[{ required: true, message: '請輸入名稱' }]}
          >
            <Input placeholder="如：一般日、假日、休館日" />
          </Form.Item>

          <Form.Item label="說明" name="description">
            <Input.TextArea rows={3} placeholder="說明文字" />
          </Form.Item>

          <Form.Item
            label="排序順序"
            name="sortOrder"
            rules={[{ required: true, message: '請輸入排序順序' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
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

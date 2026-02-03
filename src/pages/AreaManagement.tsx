import { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Space,
  message,
  Popconfirm,
  Alert,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAreas } from '../hooks/useAreas';
import type { Area } from '../api/areas';
import { useRestaurantContext } from '../contexts/RestaurantContext';

export default function AreaManagement() {
  const { selectedRestaurant } = useRestaurantContext();
  const restaurantId = selectedRestaurant?.id;

  const { areas, isLoading, createArea, updateArea, deleteArea } = useAreas(restaurantId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Area | null>(null);
  const [form] = Form.useForm();

  // 如果沒有選定餐廳，顯示提示訊息
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

  const handleEdit = (record: Area) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteArea.mutateAsync(id);
    } catch (error) {
      console.error('刪除失敗:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!restaurantId) {
        message.error('缺少餐廳 ID');
        return;
      }

      // 確保 areaCode 不為空
      const trimmedCode = values.areaCode?.trim();
      if (!trimmedCode) {
        message.error('區域代碼不可為空');
        return;
      }

      const data = {
        restaurantId,
        customerId: selectedRestaurant.customerId,
        areaCode: trimmedCode,
        areaName: values.areaName?.trim(),
        description: values.description?.trim() || undefined,
        displayOrder: values.displayOrder || 0,
        isActive: values.isActive ?? true,
      };

      if (editingRecord) {
        await updateArea.mutateAsync({ id: editingRecord.id, data });
      } else {
        await createArea.mutateAsync(data);
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error('操作失敗:', error);
      message.error('操作失敗');
    }
  };

  const columns = [
    {
      title: '顯示順序',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 100,
      sorter: (a: Area, b: Area) => a.displayOrder - b.displayOrder,
    },
    {
      title: '區域代碼',
      dataIndex: 'areaCode',
      key: 'areaCode',
      width: 120,
    },
    {
      title: '區域名稱',
      dataIndex: 'areaName',
      key: 'areaName',
      width: 150,
    },
    {
      title: '說明',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
      render: (_: unknown, record: Area) => (
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
            description="刪除區域前請確保沒有關聯的餐桌"
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
        <h2>區域管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增區域
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={areas}
        loading={isLoading}
        rowKey="id"
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 10 }}
        rowSelection={{
          type: 'checkbox',
          columnWidth: 50,
        }}
      />

      <Modal
        title={editingRecord ? '編輯區域' : '新增區域'}
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
            label="區域代碼"
            name="areaCode"
            rules={[{ required: true, message: '請輸入區域代碼' }]}
            tooltip="用於系統識別，如：1F, 2F, VIP, BAR"
          >
            <Input placeholder="如：1F, 2F, VIP, BAR" />
          </Form.Item>

          <Form.Item
            label="區域名稱"
            name="areaName"
            rules={[{ required: true, message: '請輸入區域名稱' }]}
            tooltip="顯示給用戶的名稱，如：一樓大廳、二樓包廂"
          >
            <Input placeholder="如：一樓大廳、二樓包廂" />
          </Form.Item>

          <Form.Item
            label="說明"
            name="description"
          >
            <Input.TextArea placeholder="選填，如：主要用餐區、適合家庭聚餐" rows={3} />
          </Form.Item>

          <Form.Item
            label="顯示順序"
            name="displayOrder"
            initialValue={0}
            tooltip="數字越小越靠前排序"
          >
            <InputNumber min={0} max={999} style={{ width: '100%' }} />
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

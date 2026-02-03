import { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Space,
  message,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Alert,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined } from '@ant-design/icons';
import { useTables } from '../hooks/useTables';
import type { Table as TableType } from '../api/tables';
import { useSearchParams } from 'react-router-dom';
import { useRestaurantContext } from '../contexts/RestaurantContext';

const { Option } = Select;

export default function TableManagement() {
  const { selectedRestaurant } = useRestaurantContext();
  const [searchParams] = useSearchParams();

  // 優先使用 Context 中的餐廳，其次使用 URL 參數
  const restaurantId = selectedRestaurant?.id || searchParams.get('restaurantId') || undefined;

  // 必須在所有 hooks 調用之後才能有條件返回
  const { tables, areas, isLoading, areasLoading, createTable, updateTable, deleteTable } = useTables(restaurantId);
  const [selectedAreaId, setSelectedAreaId] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TableType | null>(null);
  const [form] = Form.useForm();

  // 依區域過濾餐桌
  const filteredTables = useMemo(() => {
    let result = tables;

    // 依區域過濾
    if (selectedAreaId) {
      result = result.filter((table) => table.areaId === selectedAreaId);
    }

    // 依桌號排序
    return result.sort((a, b) => a.tableCode.localeCompare(b.tableCode));
  }, [tables, selectedAreaId]);

  // 統計各區域的餐桌數量
  const areaStats = useMemo(() => {
    const stats = new Map<string, number>();
    tables.forEach((table) => {
      const count = stats.get(table.areaId) || 0;
      stats.set(table.areaId, count + 1);
    });
    return stats;
  }, [tables]);

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

  const handleEdit = (record: TableType) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      minGuests: record.minGuests,
      maxGuests: record.maxGuests,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTable(id);
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

      // 確保 tableCode 不為空
      const trimmedCode = values.tableCode?.trim();
      if (!trimmedCode) {
        message.error('桌號不可為空');
        return;
      }

      const data = {
        restaurantId: actualRestaurantId,
        tableCode: trimmedCode,
        tableName: values.tableName?.trim() || undefined,
        areaId: values.areaId || undefined,
        tableType: values.tableType || undefined,
        minGuests: values.minGuests,
        maxGuests: values.maxGuests,
        capacity: values.maxGuests,
        isCombinable: values.isCombinable ?? true,
        isActive: values.isActive ?? true,
      };

      if (editingRecord) {
        await updateTable({ id: editingRecord.id, data });
        message.success('更新成功');
      } else {
        await createTable(data);
        message.success('建立成功');
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error('操作失敗:', error);
      message.error('操作失敗');
    }
  };

  const getAreaName = (areaId: string) => {
    const area = areas.find((a) => a.id === areaId);
    return area?.areaName || areaId;
  };

  const columns = [
    {
      title: '桌號',
      dataIndex: 'tableCode',
      key: 'tableCode',
      width: 120,
      fixed: 'left' as const,
    },
    {
      title: '桌名',
      dataIndex: 'tableName',
      key: 'tableName',
      width: 150,
    },
    {
      title: '區域',
      dataIndex: 'areaId',
      key: 'areaId',
      width: 150,
      render: (areaId: string) => getAreaName(areaId),
    },
    {
      title: '桌型',
      dataIndex: 'tableType',
      key: 'tableType',
      width: 150,
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          STANDARD: '標準桌',
          PRIVATE_ROOM: '包廂',
          SEMI_PRIVATE: '半包廂',
          BAR: '吧檯',
          BOOTH: '卡座',
          OUTDOOR: '戶外座位',
          GROUP_TABLE: '團桌',
        };
        return typeMap[type] || type;
      },
    },
    {
      title: '人數範圍',
      key: 'capacity',
      width: 120,
      render: (_: unknown, record: TableType) =>
        `${record.minGuests}-${record.maxGuests}人`,
    },
    {
      title: '可併桌',
      dataIndex: 'isCombinable',
      key: 'isCombinable',
      width: 100,
      render: (value: boolean) => (value ? '是' : '否'),
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
      render: (_: unknown, record: TableType) => (
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
        <h2>餐桌管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增餐桌
        </Button>
      </div>

      {/* 區域過濾和統計卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card
            hoverable
            style={{ cursor: 'pointer', border: !selectedAreaId ? '2px solid #1890ff' : undefined }}
            onClick={() => setSelectedAreaId(undefined)}
          >
            <Statistic
              title="全部餐桌"
              value={tables.length}
              prefix={<FilterOutlined />}
              valueStyle={{ color: !selectedAreaId ? '#1890ff' : undefined }}
            />
          </Card>
        </Col>
        {areas.map((area) => (
          <Col span={6} key={area.id}>
            <Card
              hoverable
              style={{ cursor: 'pointer', border: selectedAreaId === area.id ? '2px solid #1890ff' : undefined }}
              onClick={() => setSelectedAreaId(area.id)}
            >
              <Statistic
                title={area.areaName}
                value={areaStats.get(area.id) || 0}
                suffix="張"
                valueStyle={{ color: selectedAreaId === area.id ? '#1890ff' : undefined }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 當前顯示的區域說明 */}
      {selectedAreaId && (
        <div style={{ marginBottom: 16 }}>
          <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
            當前顯示：{getAreaName(selectedAreaId)}
          </Tag>
          <Button
            type="link"
            onClick={() => setSelectedAreaId(undefined)}
            style={{ marginLeft: 8 }}
          >
            清除過濾
          </Button>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={filteredTables}
        loading={isLoading || areasLoading}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingRecord ? '編輯餐桌' : '新增餐桌'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="桌號"
            name="tableCode"
            rules={[{ required: true, message: '請輸入桌號' }]}
          >
            <Input placeholder="如：A01, B01" />
          </Form.Item>

          <Form.Item
            label="桌名"
            name="tableName"
            rules={[{ required: true, message: '請輸入桌名' }]}
          >
            <Input placeholder="如：靠窗兩人桌、包廂A" />
          </Form.Item>

          <Form.Item
            label="區域"
            name="areaId"
            rules={[{ required: true, message: '請選擇區域' }]}
          >
            <Select
              placeholder="請選擇區域"
              loading={areasLoading}
              allowClear
            >
              {areas.map((area) => (
                <Option key={area.id} value={area.id}>
                  {area.areaName} ({area.areaCode})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="桌型"
            name="tableType"
            rules={[{ required: true, message: '請輸入桌型' }]}
          >
            <Select placeholder="請選擇桌型">
              <Option value="STANDARD">標準桌</Option>
              <Option value="PRIVATE_ROOM">包廂</Option>
              <Option value="SEMI_PRIVATE">半包廂</Option>
              <Option value="BAR">吧檯</Option>
              <Option value="BOOTH">卡座</Option>
              <Option value="OUTDOOR">戶外座位</Option>
              <Option value="GROUP_TABLE">團桌</Option>
            </Select>
          </Form.Item>

          <Space size="large" style={{ width: '100%' }}>
            <Form.Item
              label="最少人數"
              name="minGuests"
              rules={[{ required: true, message: '請輸入最少人數' }]}
            >
              <InputNumber min={1} max={20} style={{ width: 120 }} />
            </Form.Item>

            <Form.Item
              label="最多人數"
              name="maxGuests"
              rules={[{ required: true, message: '請輸入最多人數' }]}
            >
              <InputNumber min={1} max={20} style={{ width: 120 }} />
            </Form.Item>
          </Space>

          <Form.Item
            label="可併桌"
            name="isCombinable"
            valuePropName="checked"
            initialValue={true}
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

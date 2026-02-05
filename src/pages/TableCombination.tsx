import { useState } from 'react';
import { Table, Button, Tag, Modal, Form, Input, InputNumber, Switch, Space, message, Popconfirm, Alert, Collapse, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCombinations } from '../hooks/useCombinations';
import { useCombinableTables } from '../hooks/useCombinableTables';
import type { TableCombination, TableCombinationRequest, TableCombinationItemRequest } from '../api/combinations';
import type { Table } from '../api/tables';
import { useSearchParams } from 'react-router-dom';
import { useRestaurantContext } from '../contexts/RestaurantContext';

export default function TableCombinationManagement() {
  const { selectedRestaurant } = useRestaurantContext();
  const [searchParams] = useSearchParams();

  // 優先使用 Context 中的餐廳，其次使用 URL 參數
  const restaurantId = selectedRestaurant?.id || searchParams.get('restaurantId') || undefined;

  // 必須在所有 hooks 調用之後才能有條件返回
  const { data, isLoading, refetch } = useCombinations(restaurantId);
  const { data: combinableTables = [] } = useCombinableTables(restaurantId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TableCombination | null>(null);
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
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
    setSelectedTableIds([]);
    setIsModalOpen(true);
  };

  const handleEdit = (record: TableCombination) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setSelectedTableIds(record.items.map(item => item.tableId));
    setIsModalOpen(true);
  };

  const handleDelete = async (_id: string) => {
    // TODO: 實作刪除功能
    message.success('刪除成功（待實作）');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (selectedTableIds.length === 0) {
        message.error('請至少選擇一個餐桌');
        return;
      }

      // 檢查是否跨區域
      const selectedTables = combinableTables.filter(t =>
        selectedTableIds.includes(t.id)
      );
      const areaIds = [...new Set(selectedTables.map(t => t.areaId))];
      if (areaIds.length > 1) {
        message.error('所有餐桌必須屬於同一區域');
        return;
      }

      // 組裝 items
      const items: TableCombinationItemRequest[] = selectedTableIds.map((tableId, index) => ({
        tableId,
        itemOrder: index + 1,
        isRequired: true,
      }));

      const request: TableCombinationRequest = {
        ...values,
        items,
      };

      if (editingRecord) {
        await combinationsApi.update(restaurantId, editingRecord.id, request);
        message.success('更新成功');
      } else {
        await combinationsApi.create(restaurantId, request);
        message.success('新增成功');
      }

      setIsModalOpen(false);
      form.resetFields();
      setSelectedTableIds([]);
      refetch();
    } catch (error) {
      console.error('操作失敗:', error);
      message.error(editingRecord ? '更新失敗' : '新增失敗');
    }
  };

  const columns = [
    { title: '組合代碼', dataIndex: 'combinationCode', key: 'combinationCode', width: 150 },
    { title: '組合名稱', dataIndex: 'combinationName', key: 'combinationName', width: 200 },
    { title: '最小人數', dataIndex: 'minGuests', key: 'minGuests', width: 100 },
    { title: '最大人數', dataIndex: 'maxGuests', key: 'maxGuests', width: 100 },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 80 },
    {
      title: '狀態',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (value: boolean) => (value ? <Tag color="green">啟用</Tag> : <Tag color="red">停用</Tag>),
    },
    {
      title: '說明',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: unknown, record: TableCombination) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            編輯
          </Button>
          <Popconfirm title="確定要刪除嗎？" onConfirm={() => handleDelete(record.id)} okText="確定" cancelText="取消">
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
        <h1>併桌組合管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增組合
        </Button>
      </div>

      {data && data.length > 0 && (
        <div style={{ marginBottom: 16, color: '#666' }}>
          當前餐廳 ID: {restaurantId} | 共 {data.length} 個組合
        </div>
      )}

      <Table
        columns={columns}
        dataSource={data || []}
        loading={isLoading}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: (record: TableCombination) => (
            <div style={{ padding: '16px' }}>
              <h4>組合餐桌明細:</h4>
              {record.items && record.items.length > 0 ? (
                <Table
                  columns={[
                    { title: '桌號', dataIndex: 'tableCode', key: 'tableCode' },
                    { title: '桌名', dataIndex: 'tableName', key: 'tableName' },
                    { title: '容量', dataIndex: 'tableCapacity', key: 'tableCapacity' },
                    { title: '桌型', dataIndex: 'tableType', key: 'tableType' },
                    { title: '順序', dataIndex: 'itemOrder', key: 'itemOrder' },
                    { title: '必選', dataIndex: 'isRequired', key: 'isRequired', render: (v: boolean) => v ? '是' : '否' },
                    { title: '說明', dataIndex: 'notes', key: 'notes' },
                  ]}
                  dataSource={record.items}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              ) : (
                <div style={{ color: '#999' }}>此組合沒有餐桌項目</div>
              )}
            </div>
          ),
        }}
      />

      <Modal
        title={editingRecord ? '編輯併桌組合' : '新增併桌組合'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setSelectedTableIds([]);
        }}
        width={800}
        okText="確定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="組合代碼"
            name="combinationCode"
            rules={[{ required: true, message: '請輸入組合代碼' }]}
          >
            <Input placeholder="如：COMBO_8P_4X2" />
          </Form.Item>

          <Form.Item
            label="組合名稱"
            name="combinationName"
            rules={[{ required: true, message: '請輸入組合名稱' }]}
          >
            <Input placeholder="如：8人標準組合（4人桌x2）" />
          </Form.Item>

          <Space size="large" style={{ width: '100%' }}>
            <Form.Item
              label="最少人數"
              name="minGuests"
              rules={[{ required: true, message: '請輸入最少人數' }]}
            >
              <InputNumber min={1} style={{ width: 120 }} />
            </Form.Item>

            <Form.Item
              label="最多人數"
              name="maxGuests"
              rules={[{ required: true, message: '請輸入最多人數' }]}
            >
              <InputNumber min={1} style={{ width: 120 }} />
            </Form.Item>
          </Space>

          <Form.Item
            label="排序"
            name="sortOrder"
            rules={[{ required: true, message: '請輸入排序順序' }]}
          >
            <InputNumber min={1} style={{ width: 150 }} />
          </Form.Item>

          <Form.Item label="選擇餐桌">
            {combinableTables.length > 0 ? (
              (() => {
                // 依區域分組
                const groupedByArea = combinableTables.reduce((acc, table) => {
                  const areaName = table.areaName || '未分區';
                  if (!acc[areaName]) acc[areaName] = [];
                  acc[areaName].push(table);
                  return acc;
                }, {} as Record<string, Table[]>);

                return (
                  <Collapse defaultActiveKey={Object.keys(groupedByArea)} size="small">
                    {Object.entries(groupedByArea).map(([areaName, tables]) => (
                      <Collapse.Panel
                        key={areaName}
                        header={<Space><span>{areaName}</span><Tag>{tables.length}桌</Tag></Space>}
                      >
                        <Checkbox.Group
                          value={selectedTableIds}
                          onChange={(checkedValues) => setSelectedTableIds(checkedValues as string[])}
                          style={{ width: '100%' }}
                        >
                          <Space direction="vertical" style={{ width: '100%' }}>
                            {tables.map((table) => (
                              <Checkbox key={table.id} value={table.id}>
                                <Space>
                                  <span>{table.tableName} ({table.capacity}人)</span>
                                  <Tag>{table.tableType}</Tag>
                                </Space>
                              </Checkbox>
                            ))}
                          </Space>
                        </Checkbox.Group>
                      </Collapse.Panel>
                    ))}
                  </Collapse>
                );
              })()
            ) : (
              <div style={{ color: '#999' }}>此餐廳沒有可組合的餐桌</div>
            )}
            {selectedTableIds.length > 0 && (
              <div style={{ marginTop: 12, padding: '8px', background: '#f0f5ff', borderRadius: '4px' }}>
                <Space>
                  <span>已選擇</span>
                  <Tag color="green">{selectedTableIds.length}個桌號</Tag>
                  <span>：</span>
                  {combinableTables
                    .filter(t => selectedTableIds.includes(t.id))
                    .map(t => t.tableName)
                    .join(' + ')}
                </Space>
              </div>
            )}
          </Form.Item>

          <Form.Item label="說明" name="notes">
            <Input.TextArea rows={3} placeholder="說明文字" />
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

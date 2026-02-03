import { Table, Button, Space, Alert } from 'antd';
import { PlusOutlined, SettingOutlined, OrderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useRestaurants } from '../hooks/useRestaurants';
import type { Restaurant } from '../types';

export default function RestaurantList() {
  const { data, isLoading } = useRestaurants();

  const columns = [
    { title: '餐廳代碼', dataIndex: 'restaurantCode', key: 'restaurantCode' },
    { title: '餐廳名稱', dataIndex: 'restaurantName', key: 'restaurantName' },
    { title: '地址', dataIndex: 'address', key: 'address' },
    { title: '電話', dataIndex: 'phone', key: 'phone' },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Restaurant) => (
        <Space>
          <Link to={`/restaurants/${record.id}/settings`}>
            <Button type="link" icon={<SettingOutlined />}>設定</Button>
          </Link>
          <Link to={`/restaurants/${record.id}/priorities`}>
            <Button type="link" icon={<OrderedListOutlined />}>優先權</Button>
          </Link>
          <Link to={`/combinations?restaurantId=${record.id}`}>
            <Button type="link" icon={<AppstoreOutlined />}>併桌組合</Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Alert
        message="管理提示"
        description="在下方餐廳列表中，點擊「併桌組合」按鈕可管理該餐廳的併桌組合設定"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>餐廳管理</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          新增餐廳
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey="id"
      />
    </div>
  );
}

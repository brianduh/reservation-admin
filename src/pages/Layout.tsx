import { Layout, Menu, Dropdown, Avatar, Select, Space, Typography, theme } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  ShopOutlined,
  ApartmentOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TableOutlined,
  AppstoreOutlined,
  OrderedListOutlined,
  UserOutlined,
  LogoutOutlined,
  FieldTimeOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useRestaurantContext } from '../contexts/RestaurantContext';
import { useRestaurants } from '../hooks/useRestaurants';
import type { MenuProps } from 'antd';
import type { Restaurant } from '../types';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function LayoutComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { customer, logout } = useAuth();
  const { selectedRestaurant, setSelectedRestaurant } = useRestaurantContext();
  const { data: restaurants } = useRestaurants();
  const { token } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: <Link to="/">儀表板</Link> },
    { key: '/restaurants', icon: <ShopOutlined />, label: <Link to="/restaurants">餐廳管理</Link> },
    { type: 'divider' as const },
    { key: '/reservations', icon: <CalendarOutlined />, label: <Link to="/reservations">訂位管理</Link> },
    { key: '/areas', icon: <ApartmentOutlined />, label: <Link to="/areas">區域管理</Link> },
    { key: '/date-types', icon: <CalendarOutlined />, label: <Link to="/date-types">日期類型管理</Link> },
    { key: '/daily-info', icon: <InfoCircleOutlined />, label: <Link to="/daily-info">每日資訊管理</Link> },
    { key: '/date-type-meal-periods', icon: <FieldTimeOutlined />, label: <Link to="/date-type-meal-periods">日期性質餐期時間</Link> },
    { key: '/meal-periods', icon: <ClockCircleOutlined />, label: <Link to="/meal-periods">餐期管理</Link> },
    { key: '/tables', icon: <TableOutlined />, label: <Link to="/tables">餐桌管理</Link> },
    { key: '/combinations', icon: <AppstoreOutlined />, label: <Link to="/combinations">併桌組合管理</Link> },
    { key: '/table-priorities', icon: <OrderedListOutlined />, label: <Link to="/table-priorities">餐桌優先權配置</Link> },
  ];

  // 餐廳選項 - 添加安全檢查
  const restaurantOptions = restaurants?.map((r: Restaurant) => {
    if (!r || !r.id || !r.restaurantCode) {
      console.warn('Invalid restaurant data:', r);
      return null;
    }
    return {
      label: `${r.restaurantCode} - ${r.restaurantName || '未命名'}`,
      value: r.id,
      restaurant: r,
    };
  }).filter((option): option is { label: string; value: string; restaurant: Restaurant } => option !== null) || [];

  const handleRestaurantChange = (value: string | null) => {
    if (!value) {
      setSelectedRestaurant(null);
      return;
    }
    const restaurant = restaurants?.find((r: Restaurant) => r.id === value);
    if (restaurant) {
      setSelectedRestaurant(restaurant);
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'customer',
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 600 }}>{customer?.customerName}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{customer?.customerCode}</Text>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: '登出',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={260}
        theme="light"
        style={{
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.05)',
          zIndex: 10,
          borderRight: '1px solid rgba(0,0,0,0.03)'
        }}
      >
        <div style={{
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid ${token.colorSplit}`
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
            padding: '8px 16px',
            borderRadius: token.borderRadiusLG,
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '18px',
            boxShadow: `0 4px 10px ${token.colorPrimary}40`
          }}>
            訂位系統
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{
            borderRight: 0,
            padding: '16px 8px'
          }}
          items={menuItems.map(item => {
            if (item.type === 'divider') return item;
            return {
              ...item,
              style: { borderRadius: token.borderRadius }
            }
          })}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            padding: '0 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 9,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
            height: 64,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Select
              style={{ width: 320 }}
              placeholder="選擇餐廳"
              size="large"
              bordered={false}
              suffixIcon={<ShopOutlined style={{ color: token.colorPrimary }} />}
              value={selectedRestaurant?.id}
              onChange={handleRestaurantChange}
              options={restaurantOptions}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              dropdownStyle={{ padding: 8, borderRadius: token.borderRadiusLG }}
            />
          </div>

          <Space size={24}>
            <div style={{
              height: 32,
              borderRight: `1px solid ${token.colorSplit}`
            }} />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar
                  size="large"
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: token.colorPrimary,
                    boxShadow: `0 2px 8px ${token.colorPrimary}33`,
                    cursor: 'pointer'
                  }}
                />
                <Space direction="vertical" size={0} style={{ lineHeight: 1 }}>
                  <Text strong>{customer?.customerName}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{customer?.customerCode}</Text>
                </Space>
              </div>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{
          margin: '24px 32px',
          minHeight: 280,
          overflow: 'initial'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

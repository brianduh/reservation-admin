import { Card, Statistic, Row, Col } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import { useRestaurants } from '../hooks/useRestaurants';

export default function Dashboard() {
  const { data, isLoading } = useRestaurants();

  return (
    <div>
      <h1>儀表板</h1>
      <Row gutter={16}>
        <Col span={8}>
          <Card loading={isLoading}>
            <Statistic
              title="餐廳總數"
              value={data?.length || 0}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <div style={{ marginTop: 24 }}>
        <p>歡迎使用餐廳訂位系統後台管理</p>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Card, Typography, Spin, App, Tag } from 'antd';
import { UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { customersApi, type Customer } from '../api/customers';

const { Title, Text } = Typography;

export default function Login() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customersApi.getAll();
      // 只顯示啟用的客戶
      const activeCustomers = response.filter((c) => c.status === 'ACTIVE');
      setCustomers(activeCustomers);
    } catch (error) {
      message.error('載入客戶列表失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (customer: Customer) => {
    setSelectedId(customer.id);
    setTimeout(() => {
      login(customer);
      message.success(`歡迎，${customer.customerName}！`);
      navigate('/');
    }, 300);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 16 }}>
        <Spin size="large" />
        <Text type="secondary">載入中...</Text>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px',
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 600,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <UserOutlined style={{ fontSize: 64, color: '#667eea', marginBottom: 16 }} />
          <Title level={2}>餐廳訂位系統</Title>
          <Text type="secondary">請選擇要登入的客戶</Text>
        </div>

        <div>
          {customers.map((customer) => (
            <div
              key={customer.id}
              style={{
                cursor: 'pointer',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '12px',
                border: '1px solid #f0f0f0',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => handleLogin(customer)}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 20,
                  fontWeight: 'bold',
                  flexShrink: 0,
                }}
              >
                {customer.customerName.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 16 }}>
                    {customer.customerName}
                  </Text>
                  <Tag color="green">啟用中</Tag>
                </div>
                <div style={{ fontSize: 14, color: '#666' }}>
                  客戶代碼: {customer.customerCode}
                </div>
                {customer.contactEmail && (
                  <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                    {customer.contactEmail}
                  </div>
                )}
              </div>
              {selectedId === customer.id && (
                <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
              )}
            </div>
          ))}
        </div>

        {customers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">目前沒有可用的客戶</Text>
          </div>
        )}
      </Card>
    </div>
  );
}

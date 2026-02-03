import axios from 'axios';
import { message } from 'antd';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 攔截器：請求發送前加入 customerId
client.interceptors.request.use((config) => {
  const savedCustomer = localStorage.getItem('currentCustomer');
  if (savedCustomer) {
    try {
      const customer = JSON.parse(savedCustomer);
      // 將 customerId 加入到請求參數中
      config.params = {
        ...config.params,
        customerId: customer.id,
      };
    } catch (error) {
      console.error('Failed to parse customer:', error);
    }
  }
  return config;
});

// 攔截器：錯誤處理
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.message || '系統錯誤';
    message.error(errorMessage);
    return Promise.reject(error);
  }
);

export default client;

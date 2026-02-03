import client from './client';

export interface Customer {
  id: string;
  customerCode: string;
  customerName: string;
  contactEmail?: string;
  contactPhone?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';
  createdAt: string;
  updatedAt: string;
}

export const customersApi = {
  // 查詢所有客戶
  getAll: () =>
    client.get<Customer[]>('/customers'),

  // 查詢單一客戶
  getById: (id: string) =>
    client.get<Customer>(`/customers/${id}`),

  // 依代碼查詢客戶
  getByCode: (code: string) =>
    client.get<Customer>(`/customers/code/${code}`),
};

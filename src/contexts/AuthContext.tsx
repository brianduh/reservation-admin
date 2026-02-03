import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Customer } from '../api/customers';

interface AuthContextType {
  customer: Customer | null;
  login: (customer: Customer) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);

  // 從 localStorage 恢復登入狀態
  useEffect(() => {
    const savedCustomer = localStorage.getItem('currentCustomer');
    if (savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer));
      } catch (error) {
        console.error('Failed to parse saved customer:', error);
        localStorage.removeItem('currentCustomer');
      }
    }
  }, []);

  const login = (customer: Customer) => {
    setCustomer(customer);
    localStorage.setItem('currentCustomer', JSON.stringify(customer));
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem('currentCustomer');
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        login,
        logout,
        isAuthenticated: !!customer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Restaurant } from '../types';
import { useAuth } from './AuthContext';

interface RestaurantContextType {
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  clearSelectedRestaurant: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

const RESTAURANT_STORAGE_KEY = 'selectedRestaurant';

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [selectedRestaurant, setSelectedRestaurantState] = useState<Restaurant | null>(null);
  const { customer } = useAuth();

  // 從 localStorage 恢復選定的餐廳
  // 當 customer 變更時也要檢查（登入/切換客戶）
  useEffect(() => {
    const loadRestaurant = () => {
      const savedRestaurant = localStorage.getItem(RESTAURANT_STORAGE_KEY);
      if (savedRestaurant) {
        try {
          const restaurant = JSON.parse(savedRestaurant);
          // 驗證餐廳資料完整性和所屬客��
          if (restaurant && restaurant.id && restaurant.restaurantCode) {
            // 如果已登入，檢查餐廳是否屬於當前客戶
            if (customer && restaurant.customerId !== customer.id) {
              console.log('保存的餐廳不屬於當前客戶，清除選擇');
              localStorage.removeItem(RESTAURANT_STORAGE_KEY);
              setSelectedRestaurantState(null);
            } else {
              setSelectedRestaurantState(restaurant);
            }
          } else {
            localStorage.removeItem(RESTAURANT_STORAGE_KEY);
          }
        } catch (error) {
          console.error('Failed to parse saved restaurant:', error);
          localStorage.removeItem(RESTAURANT_STORAGE_KEY);
        }
      } else {
        setSelectedRestaurantState(null);
      }
    };

    loadRestaurant();
  }, [customer]); // 當 customer 變更時重新檢查

  const setSelectedRestaurant = (restaurant: Restaurant | null) => {
    setSelectedRestaurantState(restaurant);
    if (restaurant) {
      localStorage.setItem(RESTAURANT_STORAGE_KEY, JSON.stringify(restaurant));
    } else {
      localStorage.removeItem(RESTAURANT_STORAGE_KEY);
    }
  };

  const clearSelectedRestaurant = () => {
    setSelectedRestaurantState(null);
    localStorage.removeItem(RESTAURANT_STORAGE_KEY);
  };

  return (
    <RestaurantContext.Provider
      value={{
        selectedRestaurant,
        setSelectedRestaurant,
        clearSelectedRestaurant,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurantContext() {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurantContext must be used within a RestaurantProvider');
  }
  return context;
}

import { ConfigProvider, App as AntdApp } from 'antd';
import theme from './theme/themeConfig';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RestaurantProvider } from './contexts/RestaurantContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './pages/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RestaurantList from './pages/RestaurantList';
import RestaurantSetting from './pages/RestaurantSetting';
import AreaManagement from './pages/AreaManagement';
import TablePriority from './pages/TablePriority';
import TableCombination from './pages/TableCombination';
import DateTypeManagement from './pages/DateTypeManagement';
import DateTypeMealPeriodManagement from './pages/DateTypeMealPeriodManagement';
import MealPeriodManagement from './pages/MealPeriodManagement';
import TableManagement from './pages/TableManagement';
import ReservationManagement from './pages/ReservationManagement';
import DailyInfoManagement from './pages/DailyInfoManagement';
import Test from './pages/Test';

// 受保護的路由組件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider theme={theme}>
        <AntdApp>
          <AuthProvider>
            <RestaurantProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/test" element={<Test />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="restaurants" element={<RestaurantList />} />
                    <Route path="restaurants/:id/settings" element={<RestaurantSetting />} />
                    <Route path="restaurants/:id/priorities" element={<TablePriority />} />
                    <Route path="areas" element={<AreaManagement />} />
                    <Route path="date-types" element={<DateTypeManagement />} />
                    <Route path="date-type-meal-periods" element={<DateTypeMealPeriodManagement />} />
                    <Route path="meal-periods" element={<MealPeriodManagement />} />
                    <Route path="tables" element={<TableManagement />} />
                    <Route path="reservations" element={<ReservationManagement />} />
                    <Route path="combinations" element={<TableCombination />} />
                    <Route path="table-priorities" element={<TablePriority />} />
                    <Route path="daily-info" element={<DailyInfoManagement />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </RestaurantProvider>
          </AuthProvider>
        </AntdApp>
      </ConfigProvider>
    </ErrorBoundary >
  );
}

export default App;

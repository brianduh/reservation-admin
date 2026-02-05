import { useState } from 'react';
import { Button, Alert, message } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useRestaurantContext } from '../contexts/RestaurantContext';
import { useDailyInfos } from '../hooks/useDailyInfos';
import { useDateTypes } from '../hooks/useDateTypes';
import type { DailyInfo, DailyInfoRequest } from '../types/daily-info';
import DailyInfoCalendar from './components/DailyInfoCalendar';
import DailyInfoModal from './components/DailyInfoModal';
import BatchUpdateModal from './components/BatchUpdateModal';
import type { BatchUpdateRequest } from '../types/daily-info';

export default function DailyInfoManagement() {
  const { selectedRestaurant } = useRestaurantContext();
  const { useMonthQuery, create, update, batchUpdate, isMutating } = useDailyInfos(selectedRestaurant?.id);
  const { dateTypes } = useDateTypes(selectedRestaurant?.id);

  // 月份狀態
  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [currentMonth, setCurrentMonth] = useState(dayjs().month() + 1);

  // 查詢當月份資料 - monthlyData 在 runtime 是 DailyInfo[] array
  const { data: monthlyData, isLoading } = useMonthQuery(currentYear, currentMonth);
  const safeMonthlyData = (Array.isArray(monthlyData) ? monthlyData : []) as DailyInfo[];

  // Modal 狀態
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDailyInfo, setSelectedDailyInfo] = useState<DailyInfo | null>(null);

  // 建立 DateType Map（id -> {name, color}）- dateTypes 在 runtime 已經是 array
  const dateTypesMap = new Map<string, { name: string; color: string }>(
    (Array.isArray(dateTypes) ? dateTypes : []).map((dt: any) => [
      dt.id,
      { name: dt.dateName, color: dt.color || '#ffffff' },
    ])
  );

  // 處理日期點擊
  const handleDateClick = (date: dayjs.Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    const dailyInfo = safeMonthlyData.find((info) => info.targetDate === dateStr);

    setSelectedDate(dateStr);
    setSelectedDailyInfo(dailyInfo || null);
    setEditModalOpen(true);
  };

  // 處理月份切換
  const handlePanelChange = (date: dayjs.Dayjs) => {
    setCurrentYear(date.year());
    setCurrentMonth(date.month() + 1);
  };

  // 處理編輯 Modal 確認
  const handleEditModalOk = async (values: any) => {
    try {
      const data: DailyInfoRequest = {
        targetDate: selectedDate,
        restaurantId: selectedRestaurant?.id,
        dateTypeId: values.dateTypeId,
        dailyNote: values.dailyNote || undefined,
      };

      if (selectedDailyInfo) {
        // 更新現有記錄
        await update({ id: selectedDailyInfo.id, data });
        message.success('更新成功');
      } else {
        // 建立新記錄
        await create(data);
        message.success('建立成功');
      }

      setEditModalOpen(false);
    } catch (error) {
      message.error('操作失敗');
    }
  };

  // 處理批次設定
  const handleBatchUpdate = async (data: BatchUpdateRequest) => {
    try {
      const result = await batchUpdate(data);

      if (result.failed === 0) {
        message.success(`批次設定成功！共 ${result.success} 筆`);
      } else {
        message.warning(`批次設定完成！成功 ${result.success} 筆，失敗 ${result.failed} 筆`);
      }

      // 關閉 Modal 在 BatchUpdateModal 中處理
      return result;
    } catch (error) {
      message.error('批次設定失敗');
      throw error;
    }
  };

  // 如果沒有選定餐廳，顯示提示訊息
  if (!selectedRestaurant?.id) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="請先選擇要管理的餐廳"
          description="請在上方選擇下拉選單中選擇要管理的餐廳。"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      {/* 頁面標題和操作按鈕 */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>每日資訊管理</h2>
          <p style={{ margin: '4px 0 0 0', color: '#8c8c8c' }}>
            點擊日期格子編輯單日資訊，或使用批次設定功能一次設定多日
          </p>
        </div>
        <Button
          type="primary"
          icon={<CalendarOutlined />}
          onClick={() => setBatchModalOpen(true)}
        >
          批次設定
        </Button>
      </div>

      {/* 日曆組件 */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>載入中...</div>
      ) : (
        <DailyInfoCalendar
          year={currentYear}
          month={currentMonth}
          dailyInfos={safeMonthlyData}
          dateTypesMap={dateTypesMap}
          onDateClick={handleDateClick}
          onPanelChange={handlePanelChange}
        />
      )}

      {/* 單日編輯 Modal */}
      <DailyInfoModal
        open={editModalOpen}
        dailyInfo={selectedDailyInfo}
        selectedDate={selectedDate}
        restaurantId={selectedRestaurant?.id}
        onCancel={() => {
          setEditModalOpen(false);
          setSelectedDailyInfo(null);
        }}
        onOk={handleEditModalOk}
        loading={isMutating}
      />

      {/* 批次設定 Modal */}
      <BatchUpdateModal
        open={batchModalOpen}
        restaurantId={selectedRestaurant?.id}
        onCancel={() => setBatchModalOpen(false)}
        onOk={handleBatchUpdate}
        loading={isMutating}
      />
    </div>
  );
}

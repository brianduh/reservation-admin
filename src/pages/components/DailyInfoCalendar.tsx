import { Calendar } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { DailyInfo } from '../../types/daily-info';
import DailyInfoCell from './DailyInfoCell';

interface DailyInfoCalendarProps {
  year: number;
  month: number;
  dailyInfos: DailyInfo[];
  dateTypesMap: Map<string, { name: string; color: string }>;
  onDateClick: (date: Dayjs) => void;
  onPanelChange: (date: Dayjs) => void;
}

export default function DailyInfoCalendar({
  year,
  month,
  dailyInfos,
  dateTypesMap,
  onDateClick,
  onPanelChange,
}: DailyInfoCalendarProps) {
  // 建立 Map 以快速查找
  const dailyInfoMap = new Map<string, DailyInfo>();
  (Array.isArray(dailyInfos) ? dailyInfos : []).forEach((info: DailyInfo) => {
    dailyInfoMap.set(info.targetDate, info);
  });

  // 自訂日期格子渲染
  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dailyInfo = dailyInfoMap.get(dateStr);

    return (
      <DailyInfoCell
        date={value}
        dailyInfo={dailyInfo}
        dateTypesMap={dateTypesMap}
        onClick={() => onDateClick(value)}
      />
    );
  };

  // 自訂 header
  const calendarHeader = ({ value }: { value: Dayjs }) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 'bold' }}>
          {value.year()}年 {value.month() + 1}月
        </div>
      </div>
    );
  };

  return (
    <Calendar
      value={dayjs().year(year).month(month - 1)}
      onPanelChange={(date) => onPanelChange(date)}
      dateCellRender={dateCellRender}
      headerRender={calendarHeader}
      fullscreen
      style={{
        background: '#fff',
        borderRadius: 8,
        padding: 16,
      }}
    />
  );
}

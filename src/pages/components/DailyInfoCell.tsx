import { Typography, Tag, Space } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import type { DailyInfo } from '../../types/daily-info';

const { Text } = Typography;

// 日期性質顏色編碼
const DATE_TYPE_COLORS: Record<string, { color: string; bgColor: string; borderColor: string }> = {
  'NORMAL': {
    color: '#28a745',
    bgColor: '#f6ffed',
    borderColor: '#b7eb8f',
  },
  'HOLIDAY': {
    color: '#d48806',
    bgColor: '#fffbe6',
    borderColor: '#ffe58f',
  },
  'CLOSED': {
    color: '#cf1322',
    bgColor: '#fff1f0',
    borderColor: '#ffccc7',
  },
  'SPECIAL': {
    color: '#0958d9',
    bgColor: '#e6f4ff',
    borderColor: '#91caff',
  },
};

interface DailyInfoCellProps {
  date: Dayjs;
  dailyInfo?: DailyInfo;
  dateTypesMap: Map<string, { name: string; color: string }>;
  onClick: () => void;
}

export default function DailyInfoCell({ date, dailyInfo, dateTypesMap, onClick }: DailyInfoCellProps) {
  const day = date.date();

  // 獲取日期性質資訊
  const dateTypeInfo = dailyInfo?.dateTypeId
    ? dateTypesMap.get(dailyInfo.dateTypeId)
    : null;

  // 獲取顏色配置
  const colorConfig = dateTypeInfo?.color
    ? DATE_TYPE_COLORS[dateTypeInfo.color] || DATE_TYPE_COLORS['NORMAL']
    : null;

  // 格式化農曆日期
  const lunarText = dailyInfo?.lunarDate
    ? `農曆${dailyInfo.lunarDate}`
    : '';

  // 節氣
  const solarTerm = dailyInfo?.solarTerm || '';

  // 備註預覽
  const notePreview = dailyInfo?.dailyNote
    ? (dailyInfo.dailyNote.length > 10
        ? dailyInfo.dailyNote.substring(0, 10) + '...'
        : dailyInfo.dailyNote)
    : '';

  return (
    <div
      onClick={onClick}
      style={{
        minHeight: 80,
        padding: '8px',
        borderRadius: 8,
        borderLeft: colorConfig ? `4px solid ${colorConfig.borderColor}` : '4px solid #d9d9d9',
        backgroundColor: colorConfig?.bgColor || '#fafafa',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* 日期數字 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text strong style={{ fontSize: 18 }}>
          {day}
        </Text>
        {dateTypeInfo && (
          <Tag
            color={colorConfig?.color}
            style={{
              margin: 0,
              fontSize: 10,
              padding: '0 4px',
              lineHeight: '18px',
            }}
          >
            {dateTypeInfo.name}
          </Tag>
        )}
      </div>

      {/* 農曆資訊 */}
      {(lunarText || solarTerm) && (
        <Space size={4} style={{ flexWrap: 'wrap' }}>
          {lunarText && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              <CalendarOutlined style={{ marginRight: 2 }} />
              {lunarText}
            </Text>
          )}
          {solarTerm && (
            <Tag style={{ fontSize: 10, margin: 0, padding: '0 4px' }}>
              {solarTerm}
            </Tag>
          )}
        </Space>
      )}

      {/* 生肖年份（僅在農曆新年顯示） */}
      {dailyInfo && dailyInfo.zodiac && dailyInfo.lunarDay === 1 && dailyInfo.lunarMonth === 1 && (
        <Text type="secondary" style={{ fontSize: 11 }}>
          {dailyInfo.zodiac}年
        </Text>
      )}

      {/* 備註預覽 */}
      {notePreview && (
        <Text
          type="secondary"
          ellipsis={{ tooltip: dailyInfo?.dailyNote }}
          style={{ fontSize: 11, display: 'block' }}
        >
          {notePreview}
        </Text>
      )}

      {/* 宜忌標籤（若有） */}
      {dailyInfo?.suitableActivities && Array.isArray(dailyInfo.suitableActivities) && dailyInfo.suitableActivities.length > 0 && (
        <Text type="secondary" style={{ fontSize: 10 }}>
          宜：{dailyInfo.suitableActivities.slice(0, 2).join('、')}
          {dailyInfo.suitableActivities.length > 2 && '...'}
        </Text>
      )}
    </div>
  );
}

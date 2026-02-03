import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
    token: {
        fontSize: 14,
        colorPrimary: '#6366f1', // Modern Indigo
        colorSuccess: '#10b981', // Emerald
        colorWarning: '#f59e0b', // Amber
        colorError: '#ef4444',   // Red
        colorInfo: '#3b82f6',    // Blue
        borderRadius: 8,
        wireframe: false,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
    components: {
        Layout: {
            bodyBg: '#f8fafc',
        },
        Menu: {
            activeBarBorderWidth: 0,
            itemSelectedColor: '#6366f1',
            itemSelectedBg: '#e0e7ff', // Indigo 100
        },
        Card: {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            paddingLG: 24,
        },
    },
};

export default theme;

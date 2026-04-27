import type { ThemeConfig } from 'antd'

// Genesis 设计规范 → Ant Design Token 映射 (亮色主题)
export const genesisTheme: ThemeConfig = {
  token: {
    colorPrimary: '#6366F1',
    colorPrimaryHover: '#4F46E5',
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#FAFAFA',
    colorText: '#0A0A0A',
    colorTextSecondary: '#6B6B6B',
    colorTextQuaternary: '#9C9C9C',
    colorBorder: '#E8E8EC',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    borderRadius: 6,
    borderRadiusLG: 12,
    borderRadiusSM: 4,
    fontSize: 15,
    fontSizeSM: 13,
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    controlHeight: 38,
    controlHeightSM: 32,
    controlHeightLG: 44,
  },
  components: {
    Button: {
      borderRadius: 6,
      controlHeight: 38,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 6,
      paddingInline: 14,
      paddingBlock: 10,
      fontSize: 14,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Tag: {
      borderRadiusSM: 4,
    },
  },
}

// Genesis 暗色主题配置
export const genesisDarkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#818CF8',
    colorPrimaryHover: '#A5B4FC',
    colorBgContainer: '#1E1E2E',
    colorBgLayout: '#14141F',
    colorText: '#E4E4E7',
    colorTextSecondary: '#A1A1AA',
    colorTextQuaternary: '#71717A',
    colorBorder: '#3F3F5A',
    colorSuccess: '#34D399',
    colorWarning: '#FBBF24',
    colorError: '#F87171',
    borderRadius: 6,
    borderRadiusLG: 12,
    borderRadiusSM: 4,
    fontSize: 15,
    fontSizeSM: 13,
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    controlHeight: 38,
    controlHeightSM: 32,
    controlHeightLG: 44,
  },
  components: {
    Button: {
      borderRadius: 6,
      controlHeight: 38,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 6,
      paddingInline: 14,
      paddingBlock: 10,
      fontSize: 14,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Tag: {
      borderRadiusSM: 4,
    },
  },
}

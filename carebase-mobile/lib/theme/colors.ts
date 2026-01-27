export const colors = {
  light: {
    // Primary accent
    accent: '#0066CC',
    accentSoft: '#E6F0FF',
    accentHover: '#0052A3',

    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#F5F7FA',
    backgroundTertiary: '#E8ECF0',

    // Text
    textPrimary: '#1A1A1A',
    textSecondary: '#4A5568',
    textTertiary: '#718096',
    textInverse: '#FFFFFF',

    // Borders
    border: '#E2E8F0',
    borderFocused: '#0066CC',

    // Semantic colors
    success: '#22C55E',
    successSoft: '#DCFCE7',
    warning: '#F59E0B',
    warningSoft: '#FEF3C7',
    error: '#EF4444',
    errorSoft: '#FEE2E2',
    info: '#3B82F6',
    infoSoft: '#DBEAFE',
  },
  dark: {
    // Primary accent
    accent: '#3B82F6',
    accentSoft: '#1E3A5F',
    accentHover: '#60A5FA',

    // Backgrounds
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    backgroundTertiary: '#334155',

    // Text
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    textInverse: '#0F172A',

    // Borders
    border: '#334155',
    borderFocused: '#3B82F6',

    // Semantic colors
    success: '#22C55E',
    successSoft: '#14532D',
    warning: '#F59E0B',
    warningSoft: '#713F12',
    error: '#EF4444',
    errorSoft: '#7F1D1D',
    info: '#3B82F6',
    infoSoft: '#1E3A5F',
  },
} as const;

export type ColorScheme = typeof colors.light;
export type ColorKey = keyof ColorScheme;

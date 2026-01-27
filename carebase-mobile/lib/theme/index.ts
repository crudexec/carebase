import { useColorScheme } from 'react-native';
import { colors, ColorScheme } from './colors';
import { typography } from './typography';
import { spacing, cornerRadius, screenPadding } from './spacing';

export { colors, typography, spacing, cornerRadius, screenPadding };
export type { ColorScheme, ColorKey } from './colors';
export type { TypographyVariant } from './typography';
export type { SpacingKey, CornerRadiusKey } from './spacing';

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    colors: isDark ? colors.dark : colors.light,
    typography,
    spacing,
    cornerRadius,
    screenPadding,
    isDark,
  };
}

export type Theme = ReturnType<typeof useTheme>;

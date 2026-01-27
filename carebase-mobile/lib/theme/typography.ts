import { TextStyle, Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  largeTitle: {
    fontFamily,
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
  },
  title1: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  title2: {
    fontFamily,
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  title3: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
  },
  headlineMedium: {
    fontFamily,
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  headlineSmall: {
    fontFamily,
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  bodyLarge: {
    fontFamily,
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyMedium: {
    fontFamily,
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily,
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  labelLarge: {
    fontFamily,
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily,
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  labelSmall: {
    fontFamily,
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 13,
  },
  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

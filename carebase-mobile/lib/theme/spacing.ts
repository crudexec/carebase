export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const cornerRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const screenPadding = 16;

export type SpacingKey = keyof typeof spacing;
export type CornerRadiusKey = keyof typeof cornerRadius;

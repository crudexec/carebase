import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, cornerRadius, typography } from '../../lib/theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
type BadgeSize = 'small' | 'medium';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export function StatusBadge({
  label,
  variant = 'neutral',
  size = 'medium',
}: StatusBadgeProps) {
  const { colors } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'success':
        return {
          background: colors.successSoft,
          text: colors.success,
        };
      case 'warning':
        return {
          background: colors.warningSoft,
          text: colors.warning,
        };
      case 'error':
        return {
          background: colors.errorSoft,
          text: colors.error,
        };
      case 'info':
        return {
          background: colors.infoSoft,
          text: colors.info,
        };
      default:
        return {
          background: colors.backgroundTertiary,
          text: colors.textSecondary,
        };
    }
  };

  const badgeColors = getColors();
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: badgeColors.background,
          paddingVertical: isSmall ? spacing.xxs : spacing.xs,
          paddingHorizontal: isSmall ? spacing.sm : spacing.md,
        },
      ]}
    >
      <Text
        style={[
          isSmall ? styles.textSmall : styles.text,
          { color: badgeColors.text },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export function getShiftStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'IN_PROGRESS':
      return 'info';
    case 'SCHEDULED':
      return 'neutral';
    case 'CANCELLED':
    case 'NO_SHOW':
      return 'error';
    default:
      return 'neutral';
  }
}

export function getClientStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'INACTIVE':
      return 'neutral';
    case 'PENDING':
      return 'warning';
    default:
      return 'neutral';
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: cornerRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.labelSmall,
  },
  textSmall: {
    ...typography.caption,
    fontWeight: '500',
  },
});

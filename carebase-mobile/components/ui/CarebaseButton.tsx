import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme, spacing, cornerRadius, typography } from '../../lib/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'small' | 'medium' | 'large';

interface CarebaseButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function CarebaseButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: CarebaseButtonProps) {
  const { colors } = useTheme();

  const getBackgroundColor = (): string => {
    if (disabled) return colors.backgroundTertiary;

    switch (variant) {
      case 'primary':
        return colors.accent;
      case 'secondary':
        return colors.accentSoft;
      case 'destructive':
        return colors.error;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return colors.accent;
    }
  };

  const getTextColor = (): string => {
    if (disabled) return colors.textTertiary;

    switch (variant) {
      case 'primary':
        return colors.textInverse;
      case 'secondary':
        return colors.accent;
      case 'destructive':
        return colors.textInverse;
      case 'outline':
      case 'ghost':
        return colors.accent;
      default:
        return colors.textInverse;
    }
  };

  const getBorderColor = (): string | undefined => {
    if (variant === 'outline') {
      return disabled ? colors.border : colors.accent;
    }
    return undefined;
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'small':
        return {
          container: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
          },
          text: typography.labelSmall,
        };
      case 'large':
        return {
          container: {
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.xxl,
          },
          text: typography.labelLarge,
        };
      default:
        return {
          container: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
          },
          text: typography.labelMedium,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        sizeStyles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[styles.text, sizeStyles.text, { color: getTextColor() }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: cornerRadius.md,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
});

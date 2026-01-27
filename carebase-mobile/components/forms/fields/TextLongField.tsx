import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useTheme, spacing, typography, cornerRadius } from '../../../lib/theme';
import { FieldProps } from '../FieldRenderer';

export function TextLongField({ field, value, onChange, error }: FieldProps) {
  const { colors } = useTheme();

  return (
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: colors.backgroundSecondary,
          color: colors.textPrimary,
          borderColor: error ? colors.error : colors.border,
        },
      ]}
      value={value || ''}
      onChangeText={onChange}
      placeholder={field.config?.placeholder || 'Enter text...'}
      placeholderTextColor={colors.textTertiary}
      multiline
      numberOfLines={4}
      textAlignVertical="top"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    ...typography.bodyMedium,
    borderWidth: 1,
    borderRadius: cornerRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 100,
  },
});

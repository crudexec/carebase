import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useTheme, spacing, typography, cornerRadius } from '../../../lib/theme';
import { FieldProps } from '../FieldRenderer';

export function NumberField({ field, value, onChange, error }: FieldProps) {
  const { colors } = useTheme();

  const handleChange = (text: string) => {
    // Only allow numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    onChange(cleaned ? parseFloat(cleaned) : null);
  };

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
      value={value != null ? String(value) : ''}
      onChangeText={handleChange}
      placeholder={field.config?.placeholder || 'Enter number...'}
      placeholderTextColor={colors.textTertiary}
      keyboardType="decimal-pad"
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
  },
});

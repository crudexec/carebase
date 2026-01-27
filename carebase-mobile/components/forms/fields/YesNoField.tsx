import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, typography, cornerRadius } from '../../../lib/theme';
import { FieldProps } from '../FieldRenderer';

export function YesNoField({ field, value, onChange, error }: FieldProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.option,
          {
            backgroundColor: value === true ? colors.successSoft : colors.backgroundSecondary,
            borderColor: value === true ? colors.success : colors.border,
          },
        ]}
        onPress={() => onChange(true)}
      >
        <Ionicons
          name={value === true ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={value === true ? colors.success : colors.textTertiary}
        />
        <Text
          style={[
            styles.optionText,
            { color: value === true ? colors.success : colors.textPrimary },
          ]}
        >
          Yes
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.option,
          {
            backgroundColor: value === false ? colors.errorSoft : colors.backgroundSecondary,
            borderColor: value === false ? colors.error : colors.border,
          },
        ]}
        onPress={() => onChange(false)}
      >
        <Ionicons
          name={value === false ? 'close-circle' : 'ellipse-outline'}
          size={24}
          color={value === false ? colors.error : colors.textTertiary}
        />
        <Text
          style={[
            styles.optionText,
            { color: value === false ? colors.error : colors.textPrimary },
          ]}
        >
          No
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: cornerRadius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  optionText: {
    ...typography.labelMedium,
  },
});

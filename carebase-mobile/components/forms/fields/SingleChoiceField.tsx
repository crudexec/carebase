import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, typography, cornerRadius } from '../../../lib/theme';
import { FieldProps } from '../FieldRenderer';

export function SingleChoiceField({ field, value, onChange, error }: FieldProps) {
  const { colors } = useTheme();
  const options = field.config?.options || [];

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = value === option;
        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? colors.accent : colors.backgroundSecondary,
                borderColor: isSelected ? colors.accent : colors.border,
              },
            ]}
            onPress={() => onChange(option)}
            activeOpacity={0.7}
          >
            {isSelected && (
              <Ionicons
                name="checkmark"
                size={14}
                color={colors.textInverse}
                style={styles.checkIcon}
              />
            )}
            <Text
              style={[
                styles.chipText,
                { color: isSelected ? colors.textInverse : colors.textPrimary },
              ]}
              numberOfLines={2}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
  },
  checkIcon: {
    marginRight: spacing.xs,
  },
  chipText: {
    ...typography.labelSmall,
    flexShrink: 1,
  },
});

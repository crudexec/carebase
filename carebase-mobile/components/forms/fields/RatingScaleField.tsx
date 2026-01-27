import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, typography } from '../../../lib/theme';
import { FieldProps } from '../FieldRenderer';

export function RatingScaleField({ field, value, onChange, error }: FieldProps) {
  const { colors } = useTheme();
  const maxRating = field.config?.max || field.config?.maxValue || 5;
  const minRating = field.config?.min || field.config?.minValue || 1;

  const ratings = Array.from(
    { length: maxRating - minRating + 1 },
    (_, i) => i + minRating
  );

  return (
    <View>
      <View style={styles.starsContainer}>
        {ratings.map((rating) => {
          const isSelected = value !== null && value !== undefined && rating <= value;
          return (
            <TouchableOpacity
              key={rating}
              onPress={() => onChange(rating)}
              style={styles.starButton}
            >
              <Ionicons
                name={isSelected ? 'star' : 'star-outline'}
                size={32}
                color={isSelected ? colors.warning : colors.textTertiary}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      {value != null && (
        <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
          {value} / {maxRating}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  starButton: {
    padding: spacing.xs,
  },
  ratingText: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

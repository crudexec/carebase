import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useTheme, spacing, typography, cornerRadius } from '../../../lib/theme';
import { FieldProps } from '../FieldRenderer';

export function TimeField({ field, value, onChange, error }: FieldProps) {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const currentDate = value ? parseISO(value) : new Date();

  const handleChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate.toISOString());
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.backgroundSecondary,
            borderColor: error ? colors.error : colors.border,
          },
        ]}
        onPress={() => setShowPicker(true)}
      >
        <Ionicons name="time-outline" size={20} color={colors.textTertiary} />
        <Text
          style={[
            styles.buttonText,
            { color: value ? colors.textPrimary : colors.textTertiary },
          ]}
        >
          {value ? format(parseISO(value), 'h:mm a') : 'Select time...'}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={currentDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: cornerRadius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  buttonText: {
    ...typography.bodyMedium,
    flex: 1,
  },
});

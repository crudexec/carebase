import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useTheme, spacing, typography, cornerRadius } from '../../../lib/theme';
import { FieldProps } from '../FieldRenderer';

export function DateTimeField({ field, value, onChange, error }: FieldProps) {
  const { colors } = useTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const currentDate = value ? parseISO(value) : new Date();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      if (value) {
        const existing = parseISO(value);
        newDate.setHours(existing.getHours(), existing.getMinutes());
      }
      onChange(newDate.toISOString());
      if (Platform.OS === 'android') {
        setShowTimePicker(true);
      }
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = value ? parseISO(value) : new Date();
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      onChange(newDate.toISOString());
    }
  };

  return (
    <View>
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.dateButton,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: error ? colors.error : colors.border,
            },
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.textTertiary} />
          <Text
            style={[
              styles.buttonText,
              { color: value ? colors.textPrimary : colors.textTertiary },
            ]}
          >
            {value ? format(parseISO(value), 'MMM d, yyyy') : 'Date'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.timeButton,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: error ? colors.error : colors.border,
            },
          ]}
          onPress={() => setShowTimePicker(true)}
        >
          <Ionicons name="time-outline" size={20} color={colors.textTertiary} />
          <Text
            style={[
              styles.buttonText,
              { color: value ? colors.textPrimary : colors.textTertiary },
            ]}
          >
            {value ? format(parseISO(value), 'h:mm a') : 'Time'}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={currentDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: cornerRadius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  dateButton: {
    flex: 2,
  },
  timeButton: {
    flex: 1,
  },
  buttonText: {
    ...typography.bodyMedium,
  },
});

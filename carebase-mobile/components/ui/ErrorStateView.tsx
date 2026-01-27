import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, typography } from '../../lib/theme';
import { CarebaseButton } from './CarebaseButton';

interface ErrorStateViewProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorStateView({ message, onRetry }: ErrorStateViewProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.errorSoft }]}>
        <Ionicons name="alert-circle" size={32} color={colors.error} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Something went wrong
      </Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>
      {onRetry && (
        <CarebaseButton
          title="Try Again"
          onPress={onRetry}
          variant="outline"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title3,
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.bodyMedium,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.md,
  },
});

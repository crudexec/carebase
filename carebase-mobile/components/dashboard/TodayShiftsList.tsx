import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, spacing, typography, cornerRadius, screenPadding } from '../../lib/theme';
import { CarebaseCard, CarebaseButton } from '../ui';
import { Shift, api, endpoints, APIError } from '../../lib/api';
import { formatShiftTime } from '../../lib/utils/dates';
import { StatusBadge, getShiftStatusVariant } from '../ui/StatusBadge';

interface TodayShiftsListProps {
  shifts: Shift[];
  onRefresh?: () => void;
}

export function TodayShiftsList({ shifts, onRefresh }: TodayShiftsListProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const [loadingShiftId, setLoadingShiftId] = useState<string | null>(null);

  const handleCheckIn = async (shift: Shift) => {
    setLoadingShiftId(shift.id);
    try {
      await api.post(endpoints.checkIn(shift.id));
      Alert.alert(
        'Checked In',
        `You've started your shift with ${shift.client.firstName}. Have a great visit!`,
        [{ text: 'OK' }]
      );
      onRefresh?.();
    } catch (err) {
      if (err instanceof APIError && err.isAlreadyError) {
        onRefresh?.();
        Alert.alert('Already Checked In', 'You have already checked in for this shift.');
      } else {
        Alert.alert('Error', 'Failed to check in. Please try again.');
      }
    } finally {
      setLoadingShiftId(null);
    }
  };

  const handleCheckOut = async (shift: Shift) => {
    setLoadingShiftId(shift.id);
    try {
      await api.post(endpoints.checkOut(shift.id));
      Alert.alert(
        'Checked Out',
        "You've completed this shift. Great work!",
        [{ text: 'OK' }]
      );
      onRefresh?.();
    } catch (err) {
      if (err instanceof APIError && err.isAlreadyError) {
        onRefresh?.();
        Alert.alert('Already Checked Out', 'You have already checked out from this shift.');
      } else {
        Alert.alert('Error', 'Failed to check out. Please try again.');
      }
    } finally {
      setLoadingShiftId(null);
    }
  };

  if (shifts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Today's Shifts
        </Text>
        <CarebaseCard style={styles.emptyCard}>
          <View style={styles.emptyContent}>
            <Ionicons name="calendar-outline" size={32} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No shifts scheduled for today
            </Text>
          </View>
        </CarebaseCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Today's Shifts
        </Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/shifts')}>
          <Text style={[styles.seeAll, { color: colors.accent }]}>See All</Text>
        </TouchableOpacity>
      </View>

      {shifts.map((shift, index) => {
        const canCheckIn = shift.status === 'SCHEDULED' && !shift.isCheckedIn;
        const canCheckOut = shift.isCheckedIn && !shift.isCheckedOut && shift.status === 'IN_PROGRESS';
        const isLoading = loadingShiftId === shift.id;

        return (
          <CarebaseCard key={shift.id} style={[styles.shiftCard, index > 0 ? styles.shiftCardMargin : null]}>
            <TouchableOpacity
              onPress={() => router.push(`/(tabs)/shifts/${shift.id}`)}
            >
              <View style={styles.shiftHeader}>
                <View style={styles.clientInfo}>
                  <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
                    <Text style={[styles.avatarText, { color: colors.accent }]}>
                      {shift.client.firstName[0]}{shift.client.lastName[0]}
                    </Text>
                  </View>
                  <View style={styles.clientDetails}>
                    <Text style={[styles.clientName, { color: colors.textPrimary }]}>
                      {shift.client.firstName} {shift.client.lastName}
                    </Text>
                    <Text style={[styles.shiftTime, { color: colors.textSecondary }]}>
                      {formatShiftTime(shift.scheduledStart, shift.scheduledEnd)}
                    </Text>
                  </View>
                </View>
                <View style={styles.statusContainer}>
                  <StatusBadge
                    label={shift.status.replace('_', ' ')}
                    variant={getShiftStatusVariant(shift.status)}
                    size="small"
                  />
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.textTertiary}
                    style={styles.chevron}
                  />
                </View>
              </View>
            </TouchableOpacity>

            {/* Quick Action Buttons */}
            {(canCheckIn || canCheckOut) && (
              <View style={styles.actionContainer}>
                {canCheckIn && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.success }]}
                    onPress={() => handleCheckIn(shift)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={18} color="#fff" />
                        <Text style={styles.actionButtonText}>Check In</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                {canCheckOut && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.warning }]}
                    onPress={() => handleCheckOut(shift)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="arrow-forward-circle" size={18} color="#fff" />
                        <Text style={styles.actionButtonText}>Check Out</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}
          </CarebaseCard>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: screenPadding,
    marginTop: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.labelMedium,
    marginBottom: spacing.md,
  },
  seeAll: {
    ...typography.labelMedium,
  },
  emptyCard: {
    padding: spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    marginTop: spacing.sm,
  },
  shiftCard: {
    padding: spacing.md,
  },
  shiftCardMargin: {
    marginTop: spacing.sm,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientDetails: {
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.labelMedium,
  },
  clientName: {
    ...typography.headlineSmall,
  },
  shiftTime: {
    ...typography.bodySmall,
    marginTop: spacing.xxs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: spacing.xs,
  },
  actionContainer: {
    marginTop: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: cornerRadius.md,
    gap: spacing.xs,
  },
  actionButtonText: {
    ...typography.labelMedium,
    color: '#fff',
  },
});

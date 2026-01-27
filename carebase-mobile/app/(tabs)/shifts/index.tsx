import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, typography, screenPadding, cornerRadius } from '../../../lib/theme';
import { api, endpoints, Shift } from '../../../lib/api';
import { CarebaseCard, LoadingView, ErrorStateView, EmptyStateView, StatusBadge, getShiftStatusVariant } from '../../../components/ui';
import { formatShiftTime, getShiftDateLabel } from '../../../lib/utils/dates';

type FilterType = 'today' | 'upcoming' | 'past';

export default function ShiftsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('today');

  const loadShifts = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get<{ shifts: Shift[] }>(endpoints.shifts, { filter });
      setShifts(response.shifts || []);
    } catch (err) {
      console.error('Shifts load error:', err);
      setError('Failed to load shifts');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    setIsLoading(true);
    loadShifts();
  }, [loadShifts]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadShifts();
  }, [loadShifts]);

  const renderFilterButton = (type: FilterType, label: string) => {
    const isActive = filter === type;
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: isActive ? colors.accent : colors.backgroundTertiary,
          },
        ]}
        onPress={() => setFilter(type)}
      >
        <Text
          style={[
            styles.filterButtonText,
            { color: isActive ? colors.textInverse : colors.textSecondary },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderShiftItem = ({ item: shift }: { item: Shift }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/shifts/${shift.id}`)}
      style={styles.shiftItemContainer}
    >
      <CarebaseCard>
        <View style={styles.shiftHeader}>
          <View style={styles.clientInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
              <Text style={[styles.avatarText, { color: colors.accent }]}>
                {shift.client.firstName[0]}{shift.client.lastName[0]}
              </Text>
            </View>
            <View style={styles.shiftDetails}>
              <Text style={[styles.clientName, { color: colors.textPrimary }]}>
                {shift.client.firstName} {shift.client.lastName}
              </Text>
              <Text style={[styles.shiftDate, { color: colors.textSecondary }]}>
                {getShiftDateLabel(shift.scheduledStart)}
              </Text>
              <Text style={[styles.shiftTime, { color: colors.textTertiary }]}>
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
              size={20}
              color={colors.textTertiary}
              style={styles.chevron}
            />
          </View>
        </View>
      </CarebaseCard>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <LoadingView message="Loading shifts..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Shifts</Text>
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('today', 'Today')}
        {renderFilterButton('upcoming', 'Upcoming')}
        {renderFilterButton('past', 'Past')}
      </View>

      {error ? (
        <ErrorStateView message={error} onRetry={loadShifts} />
      ) : shifts.length === 0 ? (
        <EmptyStateView
          icon="calendar-outline"
          title="No Shifts"
          message={`You don't have any ${filter} shifts scheduled.`}
        />
      ) : (
        <FlatList
          data={shifts}
          keyExtractor={(item) => item.id}
          renderItem={renderShiftItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.title1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: screenPadding,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: cornerRadius.full,
  },
  filterButtonText: {
    ...typography.labelSmall,
  },
  listContent: {
    paddingHorizontal: screenPadding,
    paddingBottom: spacing.xxl,
  },
  shiftItemContainer: {
    marginBottom: spacing.sm,
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.labelMedium,
  },
  shiftDetails: {
    flex: 1,
  },
  clientName: {
    ...typography.headlineSmall,
  },
  shiftDate: {
    ...typography.bodySmall,
    marginTop: spacing.xxs,
  },
  shiftTime: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: spacing.sm,
  },
});

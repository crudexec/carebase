import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, spacing, typography, screenPadding } from '../../lib/theme';
import { useAuth } from '../../lib/auth';
import { api, endpoints, DashboardStats, Shift } from '../../lib/api';
import { LoadingView, ErrorStateView } from '../../components/ui';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { TodayShiftsList } from '../../components/dashboard/TodayShiftsList';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayShifts, setTodayShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);

      // Load stats and today's shifts in parallel
      const [statsResponse, shiftsResponse] = await Promise.all([
        api.get<{ stats: DashboardStats }>(endpoints.dashboardStats),
        api.get<{ shifts: Shift[] }>(endpoints.shifts, { filter: 'today' }),
      ]);

      setStats(statsResponse.stats);
      setTodayShifts(shiftsResponse.shifts || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadDashboard();
  }, [loadDashboard]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <LoadingView message="Loading dashboard..." />
      </SafeAreaView>
    );
  }

  if (error && !stats) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <ErrorStateView message={error} onRetry={loadDashboard} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            {getGreeting()},
          </Text>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>
            {user?.firstName || 'User'}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <StatsCard
            icon="calendar"
            label="Shifts Today"
            value={stats?.shiftsToday || 0}
            color={colors.accent}
          />
          <View style={styles.statsSpacer} />
          <StatsCard
            icon="people"
            label="Active Clients"
            value={stats?.activeClients || 0}
            color={colors.success}
          />
        </View>

        <View style={styles.statsContainer}>
          <StatsCard
            icon="document-text"
            label="Pending Notes"
            value={stats?.pendingNotes || 0}
            color={colors.warning}
          />
          <View style={styles.statsSpacer} />
          <StatsCard
            icon="time"
            label="Hours This Week"
            value={stats?.hoursThisWeek || 0}
            color={colors.info}
          />
        </View>

        <TodayShiftsList shifts={todayShifts} onRefresh={loadDashboard} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  greeting: {
    ...typography.bodyMedium,
  },
  userName: {
    ...typography.title1,
    marginTop: spacing.xxs,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: screenPadding,
    marginBottom: spacing.sm,
  },
  statsSpacer: {
    width: spacing.sm,
  },
});

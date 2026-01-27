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
import { api, endpoints, Incident, IncidentsResponse, IncidentSeverity, IncidentStatus } from '../../../lib/api';
import { CarebaseCard, LoadingView, ErrorStateView, EmptyStateView } from '../../../components/ui';

type FilterType = 'all' | 'pending' | 'approved';

const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  LOW: '#6B7280',
  MEDIUM: '#F59E0B',
  HIGH: '#EF4444',
  CRITICAL: '#DC2626',
};

const STATUS_COLORS: Record<IncidentStatus, string> = {
  PENDING: '#F59E0B',
  APPROVED: '#10B981',
  REJECTED: '#EF4444',
};

export default function IncidentsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const loadIncidents = useCallback(async () => {
    try {
      setError(null);
      const params = filter !== 'all' ? `?status=${filter.toUpperCase()}` : '';
      const response = await api.get<IncidentsResponse>(`${endpoints.incidents}${params}`);
      setIncidents(response.incidents || []);
    } catch (err) {
      console.error('Incidents load error:', err);
      setError('Failed to load incidents');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    setIsLoading(true);
    loadIncidents();
  }, [loadIncidents]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadIncidents();
  }, [loadIncidents]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

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

  const renderIncidentItem = ({ item: incident }: { item: Incident }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/incidents/${incident.id}`)}
      style={styles.incidentItemContainer}
    >
      <CarebaseCard>
        <View style={styles.incidentHeader}>
          <View style={styles.headerLeft}>
            <Text style={[styles.category, { color: colors.textPrimary }]}>
              {incident.category}
            </Text>
            <View style={[styles.severityBadge, { backgroundColor: SEVERITY_COLORS[incident.severity] + '20' }]}>
              <Text style={[styles.severityText, { color: SEVERITY_COLORS[incident.severity] }]}>
                {incident.severity}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[incident.status] + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[incident.status] }]} />
            <Text style={[styles.statusText, { color: STATUS_COLORS[incident.status] }]}>
              {incident.status}
            </Text>
          </View>
        </View>

        <View style={styles.clientInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.error + '20' }]}>
            <Text style={[styles.avatarText, { color: colors.error }]}>
              {incident.client.firstName[0]}{incident.client.lastName[0]}
            </Text>
          </View>
          <View style={styles.clientDetails}>
            <Text style={[styles.clientName, { color: colors.textPrimary }]}>
              {incident.client.firstName} {incident.client.lastName}
            </Text>
            <Text style={[styles.date, { color: colors.textTertiary }]}>
              {formatDate(incident.incidentDate)}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textTertiary}
          />
        </View>

        <Text
          style={[styles.description, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {incident.description}
        </Text>
      </CarebaseCard>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <LoadingView message="Loading incidents..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Incidents</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accent }]}
          onPress={() => router.push('/(tabs)/incidents/new')}
        >
          <Ionicons name="add" size={24} color={colors.textInverse} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('pending', 'Pending')}
        {renderFilterButton('approved', 'Approved')}
      </View>

      {error ? (
        <ErrorStateView message={error} onRetry={loadIncidents} />
      ) : incidents.length === 0 ? (
        <EmptyStateView
          icon="shield-outline"
          title="No Incidents"
          message={filter === 'all' ? "No incidents have been reported." : `No ${filter} incidents.`}
        />
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={(item) => item.id}
          renderItem={renderIncidentItem}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.title1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  incidentItemContainer: {
    marginBottom: spacing.sm,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  category: {
    ...typography.headlineSmall,
  },
  severityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: cornerRadius.full,
  },
  severityText: {
    ...typography.caption,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: cornerRadius.full,
    gap: spacing.xxs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '500',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    ...typography.labelSmall,
    fontWeight: '600',
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    ...typography.bodyMedium,
    fontWeight: '500',
  },
  date: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
  description: {
    ...typography.bodySmall,
  },
});
